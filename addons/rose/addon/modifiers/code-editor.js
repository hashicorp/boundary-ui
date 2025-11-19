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
    const pairs = trimmedLine.split(';').filter(p => p.trim());
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

    const validResourceTypes = [
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
      if (!validResourceTypes.includes(typeValue)) {
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

    // Valid actions for Boundary RBAC from https://developer.hashicorp.com/boundary/docs/rbac/resource-table
    const standardActions = [
      'create',
      'read',
      'update',
      'delete',
      'list',
    ];

    // Resource-specific actions
    const resourceSpecificActions = {
      'account': [...standardActions, 'set-password'],
      'alias': [...standardActions],
      'auth-method': [...standardActions, 'authenticate', 'change-state'],
      'auth-token': ['read', 'delete', 'list'],
      'credential': [...standardActions],
      'credential-library': [...standardActions],
      'credential-store': [...standardActions],
      'group': [...standardActions, 'add-members', 'remove-members'],
      'host': [...standardActions],
      'host-catalog': [...standardActions],
      'host-set': [...standardActions, 'add-hosts', 'remove-hosts'],
      'managed-group': [...standardActions],
      'policy': [...standardActions],
      'role': [...standardActions, 'add-principals', 'remove-principals', 'set-grants', 'set-grant-scopes'],
      'scope': [...standardActions, 'attach-storage-policy', 'detach-storage-policy'],
      'session': ['read', 'read:self', 'list', 'cancel', 'cancel:self'],
      'session-recording': ['read', 'list', 'download', 'reapply-storage-policy'],
      'storage-bucket': [...standardActions],
      'target': [...standardActions, 'authorize-session', 'add-host-sources', 'remove-host-sources', 'add-credential-sources', 'remove-credential-sources'],
      'user': [...standardActions, 'add-accounts', 'remove-accounts'],
      'worker': ['read', 'update', 'delete', 'list', 'read:self', 'update:self', 'delete:self'],
      '*': ['*', ...standardActions], // wildcard type can use wildcard or standard actions
    };

    // Validate actions field
    if (parsedFields.actions) {
      const actionsValue = parsedFields.actions.trim();
      const actionList = actionsValue.split(',').map(a => a.trim()).filter(a => a);

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
            message: 'Wildcard action "*" cannot be combined with other actions',
          });
        } else if (!hasWildcard) {
          // Validate individual actions against the resource type
          const typeValue = parsedFields.type?.trim();
          const idsValue = parsedFields.ids?.trim();

          if (typeValue && validResourceTypes.includes(typeValue)) {
            const bothWildcard = typeValue === '*' && idsValue === '*';

            let validActions;
            if (bothWildcard) {
              // When both are wildcards, collect all possible actions from all resource types
              const allActions = new Set();
              Object.values(resourceSpecificActions).forEach(actions => {
                actions.forEach(action => allActions.add(action));
              });
              validActions = Array.from(allActions);
            } else {
              // Use resource-specific actions for the given type
              validActions = resourceSpecificActions[typeValue] || standardActions;
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
  let word = context.matchBefore(/\w*/);
  if (word.from === word.to && !context.explicit) return null;
  return {
    from: word.from,
    options: [
      { label: 'target name1', type: 'keyword' },
      { label: 'target name 2', type: 'variable', detail: 't_987654321' },
      {
        label: 'target name 3',
        type: 'text',
        apply: 't_123456789',
        info: 't_123456789',
      },
    ],
  };
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
