/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { computed, action } from '@ember/object';
import { linter, autocompletion, completionKeymap, keymap } from '@hashicorp/design-system-components/codemirror';

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

function customLinter(view) {
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
    const trimStart = line.indexOf(trimmedLine);

    // Check for trailing semicolon
    if (trimmedLine.endsWith(';')) {
      const semicolonPos = lineStart + line.lastIndexOf(';');
      diagnostics.push({
        from: semicolonPos,
        to: semicolonPos + 1,
        severity: 'error',
        message: 'Grant should not end with a trailing semicolon',
      });
    }

    // Parse key-value pairs separated by semicolons
    const pairs = trimmedLine.split(';').filter((p) => p.trim());
    const parsedFields = {};
    const fieldPositions = {};

    let pairOffset = trimStart; // Start from where trimmed content begins

    for (const pair of pairs) {
      const pairInLine = line.indexOf(pair, pairOffset - trimStart);
      const [key, ...valueParts] = pair.split('=');
      const value = valueParts.join('='); // Handle cases where value contains '='

      if (!key || value === undefined) {
        // Invalid format - not a key=value pair
        const pairStart = lineStart + pairInLine;
        diagnostics.push({
          from: pairStart,
          to: pairStart + pair.length,
          severity: 'error',
          message: 'Invalid format: expected key=value',
        });
        continue;
      }

      const trimmedKey = key.trim();
      const keyStartInPair = pair.indexOf(trimmedKey);
      const valueStartInPair = pair.indexOf('=') + 1;

      parsedFields[trimmedKey] = value.trim();
      fieldPositions[trimmedKey] = {
        keyStart: lineStart + pairInLine + keyStartInPair,
        valueStart: lineStart + pairInLine + valueStartInPair,
        valueEnd: lineStart + pairInLine + pair.length,
      };

      pairOffset = pairInLine + pair.length + 1; // +1 for semicolon
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

function customCompletions(context) {
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

export default class FormRoleGrantsComponent extends Component {
  // =attributes

  customExtensions = [
    linter(customLinter),
    autocompletion({
      override: [customCompletions],
      closeOnBlur: true,
    }),
    keymap.of(completionKeymap)
  ];

  /**
   * @type {string}
   */
  @tracked newGrantString = '';

  /**
   * Returns grants currently on model, in addition to
   * grants added (or deleted) interactively by user -
   * before form submission
   * @return {[string]}
   */
  @computed('args.model.grant_strings.[]')
  get grants() {
    return this.args.model.grant_strings.map((value) => ({ value }));
  }

  /**
   * Returns grants after form submission
   * @return {[object]}
   */
  @computed('grants.@each.value')
  get grantStrings() {
    return this.grants.map((obj) => obj.value);
  }

  /**
   * True if the grant string field is empty, false otherwise.  This is used
   * to disable the submit button.
   * @return {boolean}
   */
  @computed('newGrantString')
  get cannotSave() {
    return !this.newGrantString;
  }

  // =actions

  /**
   * Calls the passed function with the grant string as an argument and then
   * clears the value of the grant string field.
   * `@addGrant` should be passed by the context calling this component.
   * @param {Function} addGrantFn
   */
  @action
  createGrant(addGrantFn) {
    addGrantFn(this.newGrantString);
    this.newGrantString = '';
  }

  @action
  onInput(doc) {
    console.log(doc);
  }
}
