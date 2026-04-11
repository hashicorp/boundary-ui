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
  const parentTypes = new Set(
    resourceTypes.filter((r) => r.parent_type).map((r) => r.parent_type),
  );
  const topLevelTypes = resourceTypes
    .filter((r) => {
      const hasCreateAction = r.collection_actions.includes('create');
      const hasListAction = r.collection_actions.includes('list');
      return !r.parent_type && (hasCreateAction || hasListAction);
    })
    .map((r) => r.type);

  const parentResourcesByPrefix = resourceTypes.reduce((map, resource) => {
    const parentType = resource.parent_type;
    if (parentType) {
      resourcesByType[parentType]?.idPrefixes.forEach((prefix) => {
        map[prefix] = parentType;
      });
    }
    return map;
  }, {});
  const templateIdTypes = [
    '{{.Account.Id}}',
    '{{.User.Id}}',
    '{{user.id}}',
    '{{account.id}}',
  ];
  return {
    resourcesByType,
    validResourceTypes,
    validActions: Array.from(allActions),
    resourcesByPrefix,
    parentResourcesByPrefix,
    templateIdTypes,
    parentTypes: Array.from(parentTypes),
    topLevelTypes,
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
    const parsedTypeField = { value: '', known: false, wildcard: false };
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
      } else {
        parsedTypeField.known = true;
      }
      parsedTypeField.value = typeValue;
      parsedTypeField.wildcard = typeValue === '*';
    }

    // Validate ids field
    const parsedIdsField = { wildcard: false };
    if (parsedFields.ids) {
      const idsValue = parsedFields.ids.trim();
      const pos = fieldPositions.ids;
      const idsList = idsValue
        .split(',')
        .map((id) => id.trim())
        .filter((id) => id);
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
        } else {
          parsedIdsField.wildcard = true;
        }
      } else {
        parsedIdsField.value = idsList;
        validateIdsField(schema, diagnostics, idsList, parsedTypeField, pos);
      }
    }

    if (!parsedFields.actions && !parsedFields.output_fields) {
      diagnostics.push({
        from: lineStart,
        to: lineEnd,
        severity: 'error',
        message: 'Missing "actions" field',
      });
    }

    if (!parsedFields.ids) {
      if (!parsedFields.type) {
        diagnostics.push({
          from: lineStart,
          to: lineEnd,
          severity: 'error',
          message: 'Missing "ids" or "type" fields',
        });
      } else if (parsedTypeField.wildcard) {
        diagnostics.push({
          from: lineStart,
          to: lineEnd,
          severity: 'error',
          message: 'Missing "ids" field for wildcard type',
        });
      } else {
        if (!parsedFields.actions && !parsedFields.output_fields) {
          diagnostics.push({
            from: lineStart,
            to: lineEnd,
            severity: 'error',
            message: 'Missing "actions" or "output_fields" field',
          });
        }
      }
    } else if (parsedIdsField.wildcard) {
      if (!parsedFields.type) {
        diagnostics.push({
          from: lineStart,
          to: lineEnd,
          severity: 'error',
          message: 'Missing "type" field for wildcard ids',
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
      } else if (actionList.includes('*')) {
        if (actionList.length > 1) {
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
        }
      } else {
        // Validate individual actions against the resource type
        validateActionsField(
          schema,
          diagnostics,
          actionList,
          parsedIdsField,
          parsedTypeField,
          fieldPositions.actions,
        );
      }
    }

    currentPos += line.length + 1; // +1 for newline
  });

  return diagnostics;
};

// Returns template, resource type, or null;
const idType = (schema, id) => {
  if (id.startsWith('{{') && id.endsWith('}}')) {
    return 'template';
  }
  const prefix = id.split('_')[0];
  return schema.resourcesByPrefix[prefix];
};

const validateIdsField = (
  schema,
  diagnostics,
  idsList,
  parsedTypeField,
  pos,
) => {
  let seenIdType;
  for (const [i, id] of idsList.entries()) {
    if (i === 0) {
      seenIdType = idType(schema, id);
    }
    const currentIdType = idType(schema, id);
    if (currentIdType === 'template') {
      if (!schema.templateIdTypes.includes(id)) {
        diagnostics.push({
          from: pos.valueStart,
          to: pos.valueEnd,
          severity: 'error',
          message: `Unknown template "${id}". Valid templates: ${schema.templateIdTypes.join(', ')}`,
        });
        return;
      }
    } else {
      if (!currentIdType) {
        diagnostics.push({
          from: pos.valueStart,
          to: pos.valueEnd,
          severity: 'error',
          message: `Invalid id "${id}"`,
        });
        return;
      }
    }
    if (currentIdType !== seenIdType) {
      diagnostics.push({
        from: pos.valueStart,
        to: pos.valueEnd,
        severity: 'error',
        message: `Ids must have the same type. Invalid id "${id}"`,
      });
      return;
    }
    if (parsedTypeField.wildcard) {
      // If type is wildcard, then pinned id(s) must support child types
      if (!schema.parentTypes.includes(currentIdType)) {
        diagnostics.push({
          from: pos.valueStart,
          to: pos.valueEnd,
          severity: 'error',
          message: `Ids must support child types. Invalid id "${id}"`,
        });
        return;
      }
    } else if (parsedTypeField.known) {
      // If type is known and not wildcard, then pinned id(s) must match the type
      const parentType =
        schema.resourcesByType[parsedTypeField.value]?.parentType;
      if (!parentType) {
        diagnostics.push({
          from: pos.valueStart,
          to: pos.valueEnd,
          severity: 'error',
          message: `Type must support child types. Invalid type "${parsedTypeField.value}"`,
        });
        return;
      }
      if (currentIdType !== parentType) {
        diagnostics.push({
          from: pos.valueStart,
          to: pos.valueEnd,
          severity: 'error',
          message: `Ids must match the type "${parentType}". Invalid id "${id}"`,
        });
        return;
      }
    }
  }
};

const validateActionsField = (
  schema,
  diagnostics,
  actionList,
  parsedIdsField,
  parsedTypeField,
  pos,
) => {
  let validActions;
  const bothWildCard = parsedIdsField.wildcard && parsedTypeField.wildcard;
  const allActionsAllowed = bothWildCard || !parsedTypeField.known;
  if (allActionsAllowed) {
    validActions = schema.validActions;
  } else {
    validActions = schema.resourcesByType[parsedTypeField.value].actions;
  }

  for (const action of actionList) {
    if (!validActions.includes(action)) {
      const errorMessage = allActionsAllowed
        ? `Invalid action "${action}"`
        : `Invalid action "${action}" for resource type "${parsedTypeField.value}". Valid actions: ${validActions.join(', ')}`;
      diagnostics.push({
        from: pos.valueStart,
        to: pos.valueEnd,
        severity: 'error',
        message: errorMessage,
      });
      break; // Only show one error per actions field
    }
  }
};

export const createGrantLinter = (grantsSchema) => {
  const schema = normalizeGrantsSchema(grantsSchema);
  return (context) => grantLinter(context, schema);
};
