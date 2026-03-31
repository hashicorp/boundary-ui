/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

const VALID_FIELDS = ['actions', 'ids', 'type', 'output_fields'];
const createDeleteTextAction = (name) => ({
  name,
  apply(view, from, to) {
    view.dispatch({
      changes: { from, to, insert: '' },
    });
  },
});

const normalizeGrantsSchema = (grantsSchema) => {
  const resourceTypes = grantsSchema.resource_types ?? [];

  const resourcesByType = resourceTypes.reduce((resources, resourceType) => {
    const collectionActions = resourceType.collection_actions ?? [];
    const idActions = resourceType.id_actions ?? [];
    const idPrefixes = resourceType.id_prefixes ?? [];

    resources[resourceType.type] = {
      actions: [...collectionActions, ...idActions],
      collectionActions,
      idActions,
      idPrefixes,
      parentType: resourceType.parent_type,
    };

    return resources;
  }, {});
  resourcesByType['*'] = {
    actions: ['*', 'read', 'update', 'delete', 'list', 'create'],
    idActions: ['read', 'update', 'delete'],
    collectionActions: ['list', 'create'],
  };

  const validResourceTypes = resourceTypes.map((resource) => resource.type);
  validResourceTypes.push('*');

  const allActions = new Set();
  Object.values(resourcesByType).forEach((resource) => {
    resource.actions.forEach((action) => allActions.add(action));
  });
  const resourcesByPrefix = resourceTypes.reduce((map, resource) => {
    resource.id_prefixes?.forEach((prefix) => {
      map[prefix] = resource.type;
    });
    return map;
  }, {});
  const parentResourcesByPrefix = resourceTypes.reduce((map, resource) => {
    const parentType = resource.parent_type;
    if (parentType) {
      resourcesByType[parentType]?.idPrefixes.forEach((prefix) => {
        map[prefix] = parentType;
      });
    }
    return map;
  }, {});
  const templateIdTypes = ['{{.Account.Id}}', '{{.User.Id}}'];
  return {
    resourcesByType,
    validResourceTypes,
    validActions: Array.from(allActions),
    resourcesByPrefix,
    parentResourcesByPrefix,
    templateIdTypes,
  };
};

const grantLinter = (context, schema) => {
  const diagnostics = [];
  const doc = context.state.doc.toString();
  const lines = doc.split('\n');

  let currentPos = 0;

  lines.forEach((line) => {
    const trimmedLine = line.trim();
    const lineStart = currentPos;
    const lineEnd = currentPos + line.length;

    // Disallow empty lines??
    // if (trimmedLine === '') {
    //   diagnostics.push({
    //     from: lineStart,
    //     to: lineEnd,
    //     severity: 'error',
    //     message: 'Remove empty lines. Each grant string must be on its own line.',
    //   });
    //   currentPos += line.length + 1; // +1 for newline
    //   return;
    // }

    // Check for whitespace
    if (line.includes(' ')) {
      const whitespaceMatch = line.match(/\s+/);
      const firstSpace = lineStart + whitespaceMatch.index;
      const lastSpace = firstSpace + whitespaceMatch[0].length;
      diagnostics.push({
        from: firstSpace,
        to: lastSpace,
        severity: 'error',
        message: 'Whitespace is not allowed',
        actions: [createDeleteTextAction('Remove whitespace')],
      });
    }

    const trimStart = line.indexOf(trimmedLine);
    // Check for trailing semicolon
    if (trimmedLine.endsWith(';')) {
      const semicolonPos = lineStart + line.lastIndexOf(';');
      diagnostics.push({
        from: semicolonPos,
        to: semicolonPos + 1,
        severity: 'error',
        message: 'Trailing semicolon is not allowed',
        actions: [createDeleteTextAction('Remove trailing semicolon')],
      });
    }

    // Check for invalid characters (only allow alphanumeric characters, equal signs, commas, semicolons, underscores, hyphens, curly braces, and periods)
    const invalidCharMatch = line.match(/[^a-zA-Z0-9=,;_*\-.{}\s]/g) || [];
    for (const invalidChar of invalidCharMatch) {
      const invalidCharIndex = lineStart + line.indexOf(invalidChar);
      diagnostics.push({
        from: invalidCharIndex,
        to: invalidCharIndex + 1,
        severity: 'error',
        message: `Invalid character "${invalidChar}"`,
        actions: [createDeleteTextAction(`Remove "${invalidChar}"`)],
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

      // Warn about duplicate fields - only the last instance of the field will be used for parsing
      if (trimmedKey in parsedFields) {
        const pos = fieldPositions[trimmedKey];
        diagnostics.push({
          from: pos.keyStart,
          to: pos.valueEnd,
          severity: 'error',
          message: `Duplicate field "${trimmedKey}" found`,
          actions: [createDeleteTextAction('Remove duplicate field')], // Action will remove the first instance of the duplicate field
        });
      }
      parsedFields[trimmedKey] = value.trim();
      fieldPositions[trimmedKey] = {
        keyStart: lineStart + pairInLine + keyStartInPair,
        valueStart: lineStart + pairInLine + valueStartInPair,
        valueEnd: lineStart + pairInLine + pair.length,
      };

      pairOffset = pairInLine + pair.length + 1; // +1 for semicolon
    }

    // Validate all fields are recognized
    for (const field of Object.keys(parsedFields)) {
      if (!VALID_FIELDS.includes(field)) {
        const pos = fieldPositions[field];
        diagnostics.push({
          from: pos.keyStart,
          to: pos.valueEnd,
          severity: 'error',
          message: `Unknown field "${field}". Valid fields are: ${VALID_FIELDS.join(', ')}`,
        });
      }
    }

    // Check for missing required fields
    if (!('actions' in parsedFields)) {
      diagnostics.push({
        from: lineStart,
        to: lineEnd,
        severity: 'error',
        message: 'Missing required field: actions',
      });
    }
    if (!('type' in parsedFields) && !('ids' in parsedFields)) {
      diagnostics.push({
        from: lineStart,
        to: lineEnd,
        severity: 'error',
        message: 'Missing required fields: ids and/or type',
      });
    }

    // Validate field values are not empty
    for (const [field, value] of Object.entries(parsedFields)) {
      if (!value.trim()) {
        const pos = fieldPositions[field];
        diagnostics.push({
          from: pos.valueStart,
          to: pos.valueEnd,
          severity: 'error',
          message: `"${field}" value cannot be empty`,
        });
      }
    }

    // Validate type field value is a valid resource type
    if (parsedFields.type) {
      const typeValue = parsedFields.type.trim();
      if (!schema.validResourceTypes.includes(typeValue)) {
        const pos = fieldPositions.type;
        diagnostics.push({
          from: pos.valueStart,
          to: pos.valueEnd,
          severity: 'error',
          message: `Invalid resource type "${typeValue}"`,
        });
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
          message: '"actions" field must contain at least one action',
        });
      } else {
        // Check if actions contain wildcard
        const hasWildcard = actionList.includes('*');

        if (hasWildcard && actionList.length > 1) {
          const pos = fieldPositions.actions;
          const wildcardIndex =
            pos.valueStart + parsedFields.actions.indexOf('*');
          diagnostics.push({
            from: wildcardIndex,
            to: wildcardIndex + 1,
            severity: 'error',
            message:
              'Wildcard action "*" cannot be combined with other actions',
            actions: [createDeleteTextAction('Remove wildcard from actions')],
          });
        } else if (!hasWildcard) {
          // Validate individual actions against the resource type
          const typeValue = parsedFields.type?.trim();
          const idsValue = parsedFields.ids?.trim();

          let validActions;
          const bothWildcard = typeValue === '*' && idsValue === '*';
          const validTypeSpecified =
            typeValue && schema.validResourceTypes.includes(typeValue);
          if (validTypeSpecified && !bothWildcard) {
            validActions = schema.resourcesByType[typeValue].actions;
          } else {
            validActions = schema.validActions;
          }

          for (const action of actionList) {
            if (!validActions.includes(action)) {
              const pos = fieldPositions.actions;
              const errorMessage =
                bothWildcard || !validTypeSpecified
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

    // Validate ids field
    if (parsedFields.ids) {
      const idsValue = parsedFields.ids.trim();
      const pos = fieldPositions.ids;
      const idsList = idsValue
        .split(',')
        .map((id) => id.trim())
        .filter((id) => id);
      const typeValue = parsedFields?.type?.trim();
      if (idsList.length === 0) {
        const pos = fieldPositions.ids;
        diagnostics.push({
          from: pos.valueStart,
          to: pos.valueEnd,
          severity: 'error',
          message: '"ids" field must contain at least one id',
        });
      } else if (idsList.includes('*')) {
        if (idsList.length > 1) {
          const wildCardIndex = pos.valueStart + parsedFields.ids.indexOf('*');
          diagnostics.push({
            from: wildCardIndex,
            to: wildCardIndex + 1, // Include wildcard and comma after it
            severity: 'error',
            message: 'Wildcard id "*" cannot be combined with other ids',
            actions: [createDeleteTextAction('Remove wildcard from ids')],
          });
        }
      } else if (typeValue === '*') {
        // If type is wildcard, then pinned id(s) must support child types
        let expectedIdType; // Type to which ids must match
        for (const id of idsList) {
          const prefix = id.split('_')[0];
          if (!schema.parentResourcesByPrefix[prefix]) {
            const pos = fieldPositions.ids;
            diagnostics.push({
              from: pos.valueStart,
              to: pos.valueEnd,
              severity: 'error',
              message: `Id must support child types. Invalid id "${id}"`,
            });
            break; // Only show one error per ids field
          }
          expectedIdType =
            expectedIdType || schema.parentResourcesByPrefix[prefix]; // Set expectedIdType based on the first id's prefix
          if (schema.parentResourcesByPrefix[prefix] !== expectedIdType) {
            const pos = fieldPositions.ids;
            diagnostics.push({
              from: pos.valueStart,
              to: pos.valueEnd,
              severity: 'error',
              message: `All ids must have the same type. Invalid id "${id}"`,
            });
            break; // Only show one error per ids field
          }
        }
      } else if (schema.validResourceTypes.includes(typeValue)) {
        // Validate pinned-id format only if type is a specific resource type (not wildcard)
        const expectedIdType =
          typeValue === 'scope'
            ? typeValue
            : schema.resourcesByType[typeValue]?.parentType;
        if (!expectedIdType) {
          diagnostics.push({
            from: fieldPositions.type.valueStart,
            to: fieldPositions.type.valueEnd,
            severity: 'error',
            message: `Resource type "${typeValue}" cannot be used for pinning by id`,
          });
        } else {
          const allowedPrefixes =
            schema.resourcesByType[expectedIdType].idPrefixes;
          for (const id of idsList) {
            const prefix = id.split('_')[0];
            if (!allowedPrefixes.includes(prefix)) {
              diagnostics.push({
                from: pos.valueStart,
                to: pos.valueEnd,
                severity: 'error',
                message: `Invalid id "${id}" for resource type "${typeValue}". Valid id prefixes: ${allowedPrefixes.join(', ')}`,
              });
              break; // Only show one error per ids field
            }
          }
        }
      } else {
        let expectedIdType; // Type to which ids must match
        for (const id of idsList) {
          const prefix = id.split('_')[0];
          if (schema.templateIdTypes.includes(id)) {
            continue; // Skip validation for valid template IDs
          }
          if (id.startsWith('{{') && id.endsWith('}}')) {
            diagnostics.push({
              from: pos.valueStart,
              to: pos.valueEnd,
              severity: 'error',
              message: `Unknown template "${id}". Valid templates: ${schema.templateIdTypes.join(', ')}`,
            });
            break; // Only show one error per ids field
          }
          if (!schema.resourcesByPrefix[prefix]) {
            diagnostics.push({
              from: pos.valueStart,
              to: pos.valueEnd,
              severity: 'error',
              message: `Invalid id "${id}"`,
            });
            break; // Only show one error per ids field
          }
          expectedIdType = expectedIdType || schema.resourcesByPrefix[prefix]; // Set expectedIdType based on the first id's prefix
          if (schema.resourcesByPrefix[prefix] !== expectedIdType) {
            diagnostics.push({
              from: pos.valueStart,
              to: pos.valueEnd,
              severity: 'error',
              message: `All ids must have the same type. Invalid id "${id}"`,
            });
            break; // Only show one error per ids field
          }
        }
      }
    }

    currentPos += line.length + 1; // +1 for newline
  });

  return diagnostics;
};

export const createGrantLinter = (grantsSchema) => {
  const schema = normalizeGrantsSchema(grantsSchema);
  return (context) => grantLinter(context, schema);
};
