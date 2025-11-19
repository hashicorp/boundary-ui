/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Modifier from 'ember-modifier';
import { registerDestructor } from '@ember/destroyable';
import { basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { autocompletion, completionKeymap } from '@codemirror/autocomplete';
import { EditorView, keymap } from '@codemirror/view';
import { linter } from '@codemirror/lint';

// Shared constants for linting and autocompletion

// Valid Boundary resource types from https://developer.hashicorp.com/boundary/docs/rbac/resource-table
const VALID_RESOURCE_TYPES = [
  '*', // wildcard is allowed
  'account',
  'alias',
  'auth-method',
  'auth-token',
  'credential',
  'credential-library',
  'credential-store',
  'group',
  'host',
  'host-catalog',
  'host-set',
  'managed-group',
  'policy',
  'role',
  'scope',
  'session',
  'session-recording',
  'storage-bucket',
  'target',
  'user',
  'worker',
];

// Standard actions available for most resources
const STANDARD_ACTIONS = ['create', 'read', 'update', 'delete', 'list'];

// Resource-specific actions mapping
const RESOURCE_SPECIFIC_ACTIONS = {
  account: [...STANDARD_ACTIONS, 'set-password'],
  alias: [...STANDARD_ACTIONS],
  'auth-method': [...STANDARD_ACTIONS, 'authenticate', 'change-state'],
  'auth-token': ['read', 'delete', 'list'],
  credential: [...STANDARD_ACTIONS],
  'credential-library': [...STANDARD_ACTIONS],
  'credential-store': [...STANDARD_ACTIONS],
  group: [...STANDARD_ACTIONS, 'add-members', 'remove-members'],
  host: [...STANDARD_ACTIONS],
  'host-catalog': [...STANDARD_ACTIONS],
  'host-set': [...STANDARD_ACTIONS, 'add-hosts', 'remove-hosts'],
  'managed-group': [...STANDARD_ACTIONS],
  policy: [...STANDARD_ACTIONS],
  role: [
    ...STANDARD_ACTIONS,
    'add-principals',
    'remove-principals',
    'set-grants',
    'set-grant-scopes',
  ],
  scope: [
    ...STANDARD_ACTIONS,
    'attach-storage-policy',
    'detach-storage-policy',
  ],
  session: ['read', 'read:self', 'list', 'cancel', 'cancel:self'],
  'session-recording': ['read', 'list', 'download', 'reapply-storage-policy'],
  'storage-bucket': [...STANDARD_ACTIONS],
  target: [
    ...STANDARD_ACTIONS,
    'authorize-session',
    'add-host-sources',
    'remove-host-sources',
    'add-credential-sources',
    'remove-credential-sources',
  ],
  user: [...STANDARD_ACTIONS, 'add-accounts', 'remove-accounts'],
  worker: [
    'read',
    'update',
    'delete',
    'list',
    'read:self',
    'update:self',
    'delete:self',
  ],
  '*': ['*', ...STANDARD_ACTIONS], // wildcard type can use wildcard or standard actions
};

function myCustomLinter(view) {
  const diagnostics = [];
  const doc = view.state.doc.toString();
  const lines = doc.split('\n');

  let currentPos = 0;

  lines.forEach((line) => {
    const trimmedLine = line.trim();

    // Skip empty lines
    if (!trimmedLine) {
      currentPos += line.length + 1; // +1 for newline
      return;
    }

    const lineStart = currentPos;
    const lineEnd = currentPos + line.length;

    // Check for trailing semicolon
    if (trimmedLine.endsWith(';')) {
      diagnostics.push({
        from: lineEnd - 1,
        to: lineEnd,
        severity: 'error',
        message: 'Grant should not end with a trailing semicolon',
      });
    }

    // Parse key-value pairs separated by semicolons
    const pairs = trimmedLine.split(';').filter((p) => p.trim());
    const parsedFields = {};
    const fieldPositions = {};

    for (const pair of pairs) {
      const [key, ...valueParts] = pair.split('=');
      const value = valueParts.join('='); // Handle cases where value contains '='

      if (!key || value === undefined) {
        // Invalid format - not a key=value pair
        const pairStart = lineStart + line.indexOf(pair);
        diagnostics.push({
          from: pairStart,
          to: pairStart + pair.length,
          severity: 'error',
          message: 'Invalid format: expected key=value',
        });
        currentPos += line.length + 1;
        return;
      }

      const trimmedKey = key.trim();

      parsedFields[trimmedKey] = value.trim();
      fieldPositions[trimmedKey] = {
        keyStart: lineStart + line.indexOf(pair),
        valueStart: lineStart + line.indexOf(pair) + key.length + 1,
        valueEnd: lineStart + line.indexOf(pair) + pair.length,
      };
    }

    // Check for required fields
    const requiredFields = ['type', 'actions'];
    const optionalFields = ['ids', 'output_fields'];
    const allValidFields = [...requiredFields, ...optionalFields];

    // Validate all fields are recognized
    for (const field of Object.keys(parsedFields)) {
      if (!allValidFields.includes(field)) {
        const pos = fieldPositions[field];
        diagnostics.push({
          from: pos.keyStart,
          to: pos.valueEnd,
          severity: 'error',
          message: `Unknown field "${field}". Valid fields are: ${allValidFields.join(', ')}`,
        });
      }
    }

    // Check for missing required fields
    for (const required of requiredFields) {
      if (!(required in parsedFields)) {
        diagnostics.push({
          from: lineStart,
          to: lineEnd,
          severity: 'error',
          message: `Missing required field: ${required}`,
        });
      }
    }

    // Validate field values are not empty
    for (const [field, value] of Object.entries(parsedFields)) {
      if (!value.trim()) {
        const pos = fieldPositions[field];
        diagnostics.push({
          from: pos.valueStart,
          to: pos.valueEnd,
          severity: 'error',
          message: `${field} value cannot be empty`,
        });
      }
    }

    // Validate type field value is a valid resource type
    if (parsedFields.type) {
      const typeValue = parsedFields.type.trim();
      if (!VALID_RESOURCE_TYPES.includes(typeValue)) {
        const pos = fieldPositions.type;
        diagnostics.push({
          from: pos.valueStart,
          to: pos.valueEnd,
          severity: 'error',
          message: `Invalid resource type "${typeValue}"`,
        });
      } else if (typeValue === '*') {
        // Type wildcard is only valid when ids is also a wildcard
        const idsValue = parsedFields.ids?.trim();
        if (idsValue !== '*') {
          const pos = fieldPositions.type;
          diagnostics.push({
            from: pos.valueStart,
            to: pos.valueEnd,
            severity: 'error',
            message: 'Wildcard type "*" requires ids to also be "*"',
          });
        }
      }
    }

    // Validate actions field
    if (parsedFields.actions) {
      const actionsValue = parsedFields.actions.trim();
      const actionList = actionsValue
        .split(',')
        .map((a) => a.trim())
        .filter((a) => a);

      if (actionList.length === 0) {
        const pos = fieldPositions.actions;
        diagnostics.push({
          from: pos.valueStart,
          to: pos.valueEnd,
          severity: 'error',
          message: 'actions must contain at least one action',
        });
      } else {
        // Check if actions contain wildcard
        const hasWildcard = actionList.includes('*');

        if (hasWildcard && actionList.length > 1) {
          const pos = fieldPositions.actions;
          diagnostics.push({
            from: pos.valueStart,
            to: pos.valueEnd,
            severity: 'error',
            message:
              'Wildcard action "*" cannot be combined with other actions',
          });
        } else if (!hasWildcard) {
          // Validate individual actions against the resource type
          const typeValue = parsedFields.type?.trim();
          const idsValue = parsedFields.ids?.trim();

          if (typeValue && VALID_RESOURCE_TYPES.includes(typeValue)) {
            const bothWildcard = typeValue === '*' && idsValue === '*';

            let validActions;
            if (bothWildcard) {
              // When both are wildcards, collect all possible actions from all resource types
              const allActions = new Set();
              Object.values(RESOURCE_SPECIFIC_ACTIONS).forEach((actions) => {
                actions.forEach((action) => allActions.add(action));
              });
              validActions = Array.from(allActions);
            } else {
              // Use resource-specific actions for the given type
              validActions =
                RESOURCE_SPECIFIC_ACTIONS[typeValue] || STANDARD_ACTIONS;
            }

            for (const action of actionList) {
              if (!validActions.includes(action)) {
                const pos = fieldPositions.actions;
                const errorMessage = bothWildcard
                  ? `Invalid action "${action}". Must be a valid Boundary action`
                  : `Invalid action "${action}" for resource type "${typeValue}". Valid actions: ${validActions.join(', ')}`;
                diagnostics.push({
                  from: pos.valueStart,
                  to: pos.valueEnd,
                  severity: 'error',
                  message: errorMessage,
                });
                break; // Only show one error per actions field
              }
            }
          }
        }
      }
    }

    currentPos += line.length + 1; // +1 for newline
  });

  return diagnostics;
}

function myCompletions(context) {
  const line = context.state.doc.lineAt(context.pos);
  const lineText = line.text;
  const posInLine = context.pos - line.from;

  // Find what we're completing
  const beforeCursor = lineText.slice(0, posInLine);

  // Check if we're completing a field name
  const fieldNameMatch = beforeCursor.match(/(?:^|;)\s*([a-z_]*)$/);
  if (fieldNameMatch) {
    const partial = fieldNameMatch[1];
    const fields = ['ids=', 'type=', 'actions=', 'output_fields='];

    // Parse existing fields to avoid duplicates
    const existingFields = lineText
      .split(';')
      .map((pair) => {
        const eqIndex = pair.indexOf('=');
        return eqIndex > -1 ? pair.slice(0, eqIndex).trim() : '';
      })
      .filter(Boolean);

    const availableFields = fields.filter(
      (field) => !existingFields.includes(field.replace('=', '')),
    );

    return {
      from: context.pos - partial.length,
      options: availableFields.map((field) => ({
        label: field,
        type: 'keyword',
      })),
    };
  }

  // Check if we're completing a type value
  const typeValueMatch = beforeCursor.match(/type=([a-z-*]*)$/);
  if (typeValueMatch) {
    const partial = typeValueMatch[1];

    // Check if ids field exists and is wildcard
    const idsMatch = lineText.match(/ids=([^;]*)/);
    const idsValue = idsMatch ? idsMatch[1].trim() : null;

    // Filter types based on ids value
    let availableTypes = VALID_RESOURCE_TYPES;
    if (idsValue !== '*') {
      // If ids is not wildcard, exclude wildcard type
      availableTypes = VALID_RESOURCE_TYPES.filter((t) => t !== '*');
    }

    return {
      from: context.pos - partial.length,
      options: availableTypes.map((type) => ({
        label: type,
        type: 'type',
      })),
    };
  }

  // Check if we're completing an ids value
  const idsValueMatch = beforeCursor.match(/ids=([a-z0-9_*-]*)$/);
  if (idsValueMatch) {
    const partial = idsValueMatch[1];

    return {
      from: context.pos - partial.length,
      options: [
        {
          label: '*',
          type: 'constant',
          info: 'Wildcard - matches all IDs',
        },
      ],
    };
  }

  // Check if we're completing actions
  const actionsValueMatch = beforeCursor.match(/actions=([a-z0-9_:,*-]*)$/);
  if (actionsValueMatch) {
    const actionsStr = actionsValueMatch[1];
    const lastComma = actionsStr.lastIndexOf(',');
    const partial =
      lastComma > -1 ? actionsStr.slice(lastComma + 1) : actionsStr;

    // Parse the type from the line to get valid actions
    const typeMatch = lineText.match(/type=([^;]*)/);
    const typeValue = typeMatch ? typeMatch[1].trim() : null;

    // Get valid actions based on type (include wildcard for completion suggestions)
    let validActions = ['*', ...STANDARD_ACTIONS];
    if (typeValue) {
      const idsMatch = lineText.match(/ids=([^;]*)/);
      const idsValue = idsMatch ? idsMatch[1].trim() : null;
      const bothWildcard = typeValue === '*' && idsValue === '*';

      if (bothWildcard) {
        // Collect all possible actions
        const allActions = new Set(['*']); // Include wildcard in completions
        Object.values(RESOURCE_SPECIFIC_ACTIONS).forEach((actions) => {
          actions.forEach((action) => allActions.add(action));
        });
        validActions = Array.from(allActions);
      } else if (RESOURCE_SPECIFIC_ACTIONS[typeValue]) {
        validActions = ['*', ...RESOURCE_SPECIFIC_ACTIONS[typeValue]];
      }
    }

    // Filter out already selected actions
    const selectedActions = actionsStr
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean);
    const availableActions = validActions.filter(
      (action) =>
        !selectedActions.includes(action) || action === partial.trim(),
    );

    return {
      from: context.pos - partial.length,
      options: availableActions.map((action) => ({
        label: action,
        type: 'function',
      })),
    };
  }

  // Check if we're completing output_fields
  const outputFieldsMatch = beforeCursor.match(
    /output_fields=([a-z0-9_,*-]*)$/,
  );
  if (outputFieldsMatch) {
    const fieldsStr = outputFieldsMatch[1];
    const lastComma = fieldsStr.lastIndexOf(',');
    const partial = lastComma > -1 ? fieldsStr.slice(lastComma + 1) : fieldsStr;

    return {
      from: context.pos - partial.length,
      options: [
        { label: '*', type: 'constant', apply: '*', info: 'All fields' },
      ],
    };
  }

  return null;
}

/**
 * Language mode mappings for CodeMirror 6
 */
const LANGUAGE_EXTENSIONS = {
  javascript: javascript(),
};

/**
 * Theme mappings for CodeMirror 6
 */
const THEME_EXTENSIONS = {
  monokai: oneDark,
  'one-dark': oneDark,
};

/**
 * Creates the extensions array based on configuration
 */
function createExtensions(options, onChange, lint, extensions) {
  const extensionsList = [basicSetup];

  // Add language support
  const languageExtension = LANGUAGE_EXTENSIONS[options.mode];
  if (languageExtension) {
    extensionsList.push(languageExtension);
  }

  // Add theme
  const themeExtension = THEME_EXTENSIONS[options.theme];
  if (themeExtension) {
    extensionsList.push(themeExtension);
  }

  // Add autocompletion with custom completions
  if (options.autocomplete) {
    const autocompletionConfig = {
      override: [myCompletions],
      closeOnBlur: true,
    };

    extensionsList.push(autocompletion(autocompletionConfig));
    extensionsList.push(keymap.of(completionKeymap));
  }

  // Add read-only mode
  if (options.readOnly) {
    extensionsList.push(EditorState.readOnly.of(true));
  }

  // Add update listener for onChange callback
  if (onChange) {
    extensionsList.push(
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          const newValue = update.state.doc.toString();
          onChange(newValue);
        }
      }),
    );
  }

  // Add linting if configured
  if (lint) {
    const myLinterExtension = linter(myCustomLinter);
    // const lintExtension = linter(() => []);
    extensionsList.push(myLinterExtension);
  }

  // Add custom extensions if provided
  if (extensions) {
    extensionsList.push(...extensions);
  }

  return extensionsList;
}

/**
 * CodeMirror editor modifier for Rose components
 *
 * @example
 * <div {{code-editor
 *   value=this.codeValue
 *   onChange=this.handleCodeChange
 *   mode="javascript"
 *   theme="one-dark"
 *   completions=this.customCompletions
 *   lineNumbers=true
 *   readOnly=false
 * }}></div>
 */
export default class CodeEditorModifier extends Modifier {
  editor = null;
  currentValue = '';

  constructor(owner, args) {
    super(owner, args);

    // Register destructor for proper cleanup
    registerDestructor(this, () => {
      if (this.editor) {
        this.editor.destroy();
        this.editor = null;
      }
    });
  }

  #setup(element, named) {
    const {
      value = '',
      onChange,
      mode = 'javascript',
      theme = 'one-dark',
      lineNumbers = true,
      readOnly = false,
      autocomplete = true,
      lint,
      extensions,
    } = named;

    this.currentValue = value;

    const options = {
      mode,
      theme,
      lineNumbers,
      readOnly,
      autocomplete,
    };

    // Create extensions
    const extensionsList = createExtensions(
      options,
      onChange,
      lint,
      extensions,
    );

    // Create initial state
    const state = EditorState.create({
      doc: value,
      extensions: extensionsList,
    });

    // Create editor view
    this.editor = new EditorView({
      state,
      parent: element,
    });
  }

  modify(element, _positional, named) {
    // Setup editor on first run
    if (!this.editor) {
      this.#setup(element, named);
      return;
    }

    const { value = '' } = named;

    // Update editor value if it changed externally
    if (value !== this.currentValue) {
      this.currentValue = value;

      const transaction = this.editor.state.update({
        changes: {
          from: 0,
          to: this.editor.state.doc.length,
          insert: this.currentValue,
        },
      });

      this.editor.dispatch(transaction);
    }
  }
}
