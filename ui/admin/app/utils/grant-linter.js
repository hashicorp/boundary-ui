/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

const GRANT_FIELDS = ['ids', 'type', 'actions', 'output_fields'];
const ID_TEMPLATES = [
  '{{.Account.Id}}',
  '{{.User.Id}}',
  '{{user.id}}',
  '{{account.id}}',
];

const createDeleteTextAction = (name) => ({
  name,
  apply(view, from, to) {
    view.dispatch({
      changes: { from, to },
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

  const validResourceTypes = resourceTypes.map((resource) => resource.type);
  validResourceTypes.push('*');

  const allActions = new Set();
  Object.values(resourcesByType).forEach((resource) => {
    resource.actions.forEach((action) => allActions.add(action));
  });
  const validActions = Array.from(allActions);
  validActions.push('*');
  validActions.push('no-op');

  const resourcesByPrefix = resourceTypes.reduce((map, resource) => {
    resource.id_prefixes?.forEach((prefix) => {
      map[prefix] = resource.type;
    });
    return map;
  }, {});

  let parentTypes = new Set(
    resourceTypes.filter((r) => r.parent_type).map((r) => r.parent_type),
  );
  parentTypes = Array.from(parentTypes);

  const topLevelTypes = resourceTypes
    .filter((r) => {
      const hasCreateAction = r.collection_actions.includes('create');
      const hasListAction = r.collection_actions.includes('list');
      return !r.parent_type && (hasCreateAction || hasListAction);
    })
    .map((r) => r.type);

  const childResourceTypesByParentType = resourceTypes.reduce(
    (childrenByParentType, resourceType) => {
      const parentType = resourceType.parent_type;

      if (!parentType) {
        return childrenByParentType;
      }

      childrenByParentType[parentType] = [
        ...(childrenByParentType[parentType] ?? []),
        resourceType.type,
      ];

      return childrenByParentType;
    },
    {},
  );

  return {
    resourcesByType,
    validResourceTypes,
    validActions,
    resourcesByPrefix,
    childResourceTypesByParentType,
    parentTypes,
    topLevelTypes,
  };
};

const grantLinter = (context, schema, translate) => {
  const diagnostics = [];
  const doc = context.state.doc.toString();
  const lines = doc.split('\n');

  let currentPos = 0;

  lines.forEach((line) => {
    const trimmedLine = line.trim();
    const lineStart = currentPos;
    const lineEnd = currentPos + line.length;

    // Check for whitespace
    const whitespaceMatches = line.matchAll(/\s+/g);
    for (const match of whitespaceMatches) {
      const spaceStart = lineStart + match.index;
      const spaceEnd = spaceStart + match[0].length;
      diagnostics.push({
        from: spaceStart,
        to: spaceEnd,
        severity: 'error',
        message: translate('general.whitespace-not-allowed'),
        actions: [createDeleteTextAction(translate('editor.remove'))],
      });
    }

    const trimStart = line.indexOf(trimmedLine);
    // Check for leading semicolon
    if (trimmedLine.startsWith(';')) {
      diagnostics.push({
        from: lineStart,
        to: lineStart + trimStart + 1,
        severity: 'error',
        message: translate('general.leading-semicolon-not-allowed'),
        actions: [createDeleteTextAction(translate('editor.remove'))],
      });
    }

    // Check for trailing semicolon
    if (trimmedLine.endsWith(';')) {
      const semicolonPos = lineStart + line.lastIndexOf(';');
      diagnostics.push({
        from: semicolonPos,
        to: semicolonPos + 1,
        severity: 'error',
        message: translate('general.trailing-semicolon-not-allowed'),
        actions: [createDeleteTextAction(translate('editor.remove'))],
      });
    }

    // Check for invalid characters (only allow alphanumeric characters, equal signs, commas, semicolons, underscores, hyphens, curly braces, and periods)
    const invalidCharMatch = line.match(/[^a-zA-Z0-9=,;:_*\-.{}\s]/g) || [];
    for (const invalidChar of invalidCharMatch) {
      const invalidCharIndex = lineStart + line.indexOf(invalidChar);
      diagnostics.push({
        from: invalidCharIndex,
        to: invalidCharIndex + 1,
        severity: 'error',
        message: translate('general.invalid-character', {
          character: invalidChar,
        }),
        actions: [createDeleteTextAction(translate('editor.remove'))],
      });
    }

    // Parse key-value pairs separated by semicolons
    const pairs = trimmedLine.split(';').filter((p) => p.trim());
    const parsedFields = {};
    const fieldPositions = {};
    const allFields = [];
    const fieldKeyCount = {};

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
          message: translate('general.invalid-format'),
        });
        continue;
      }

      const trimmedKey = key.trim();
      const keyStartInPair = pair.indexOf(trimmedKey);
      const valueStartInPair = pair.indexOf('=') + 1;

      const pos = {
        keyStart: lineStart + pairInLine + keyStartInPair,
        valueStart: lineStart + pairInLine + valueStartInPair,
        valueEnd: lineStart + pairInLine + pair.length,
      };
      allFields.push({ key: trimmedKey, value: value.trim(), pos });
      fieldKeyCount[trimmedKey] = (fieldKeyCount[trimmedKey] ?? 0) + 1;

      pairOffset = pairInLine + pair.length + 1; // +1 for semicolon
    }

    // Validate there are no duplicate fields and store the last instance of each field for further validation
    for (const field of allFields) {
      parsedFields[field.key] = field.value;
      fieldPositions[field.key] = field.pos;
      if (fieldKeyCount[field.key] > 1) {
        diagnostics.push({
          from: field.pos.keyStart,
          to: field.pos.valueEnd,
          severity: 'error',
          message: translate('fields.duplicate-field', {
            field: field.key,
          }),
        });
      }
    }

    // Validate all fields are recognized
    for (const field of Object.keys(parsedFields)) {
      if (!GRANT_FIELDS.includes(field)) {
        const pos = fieldPositions[field];
        diagnostics.push({
          from: pos.keyStart,
          to: pos.valueEnd,
          severity: 'error',
          message: translate('fields.unknown-field', { field }),
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
          message: translate('fields.empty-value', { field }),
        });
      }
    }

    const validatedFields = {};

    // Validate type field value is a valid resource type
    if (parsedFields.type) {
      validatedFields.type = { value: '', wildcard: false };
      const typeValue = parsedFields.type.trim();
      const pos = fieldPositions.type;
      if (!schema.validResourceTypes.includes(typeValue)) {
        diagnostics.push({
          from: pos.valueStart,
          to: pos.valueEnd,
          severity: 'error',
          message: translate('type.invalid-type', { type: typeValue }),
        });
      } else {
        validatedFields.type.value = typeValue;
        if (!parsedFields.ids) {
          if (!schema.topLevelTypes.includes(typeValue)) {
            diagnostics.push({
              from: pos.valueStart,
              to: pos.valueEnd,
              severity: 'error',
              message: translate('type.not-top-level', {
                type: typeValue,
              }),
            });
          }
        }
      }
      validatedFields.type.wildcard = typeValue === '*';
    }

    // Validate ids field
    if (parsedFields.ids) {
      validatedFields.ids = { value: [], knownType: '', wildcard: false };
      const pos = fieldPositions.ids;
      const idsList = validateListField(
        parsedFields.ids,
        pos,
        diagnostics,
        translate,
      );
      if (idsList.length === 0) {
        diagnostics.push({
          from: pos.valueStart,
          to: pos.valueEnd,
          severity: 'error',
          message: translate('ids.empty-list'),
        });
      } else if (idsList.includes('*')) {
        if (idsList.length > 1) {
          const wildCardIndex = pos.valueStart + parsedFields.ids.indexOf('*');
          diagnostics.push({
            from: wildCardIndex,
            to: wildCardIndex + 1, // Include wildcard and comma after it
            severity: 'error',
            message: translate('ids.wildcard-cannot-combine'),
          });
        } else {
          validatedFields.ids.wildcard = true;
          if (!parsedFields.type) {
            diagnostics.push({
              from: lineStart,
              to: lineEnd,
              severity: 'error',
              message: translate('type.missing-for-wildcard-ids'),
            });
          }
        }
      } else {
        const validIdType = validateIdsField(
          schema,
          diagnostics,
          idsList,
          validatedFields.type,
          pos,
          fieldPositions.type,
          translate,
        );
        if (validIdType) {
          validatedFields.ids.knownType = validIdType;
        }
      }
    }

    if (!validatedFields.ids) {
      if (!validatedFields.type) {
        diagnostics.push({
          from: lineStart,
          to: lineEnd,
          severity: 'error',
          message: translate('fields.missing-ids-or-type'),
        });
      } else if (validatedFields.type.wildcard) {
        diagnostics.push({
          from: lineStart,
          to: lineEnd,
          severity: 'error',
          message: translate('type.wildcard-requires-ids'),
        });
      } else {
        if (!parsedFields.actions && !parsedFields.output_fields) {
          diagnostics.push({
            from: lineStart,
            to: lineEnd,
            severity: 'error',
            message: translate('fields.missing-actions-or-output-fields'),
          });
        }
      }
    } else {
      if (!parsedFields.actions && !parsedFields.output_fields) {
        diagnostics.push({
          from: lineStart,
          to: lineEnd,
          severity: 'error',
          message: translate('fields.missing-actions'),
        });
      }
    }

    // Validate actions field
    if (parsedFields.actions) {
      const pos = fieldPositions.actions;
      const actionList = validateListField(
        parsedFields.actions,
        pos,
        diagnostics,
        translate,
      );
      if (actionList.length === 0) {
        diagnostics.push({
          from: pos.valueStart,
          to: pos.valueEnd,
          severity: 'error',
          message: translate('actions.empty-list'),
        });
      } else if (actionList.includes('*') && actionList.length > 1) {
        const wildcardIndex =
          pos.valueStart + parsedFields.actions.indexOf('*');
        diagnostics.push({
          from: wildcardIndex,
          to: wildcardIndex + 1,
          severity: 'error',
          message: translate('actions.wildcard-cannot-combine'),
          actions: [createDeleteTextAction(translate('editor.remove'))],
        });
      } else {
        // Validate individual actions against the resource type
        validateActionsField(
          schema,
          diagnostics,
          actionList,
          validatedFields,
          pos,
          translate,
        );
      }
    }
    currentPos += line.length + 1; // +1 for newline
  });

  return diagnostics;
};

const validateListField = (fieldValue, pos, diagnostics, translate) => {
  const unfilteredVals = fieldValue.split(',');
  const valList = [];
  let segmentStart = 0;
  const maxIndex = unfilteredVals.length - 1;
  for (const [index, val] of unfilteredVals.entries()) {
    const emptyVal = val.match(/^\s*$/);
    if (!emptyVal) {
      valList.push(val);
    }
    if (index < maxIndex) {
      const emptyNextVal = unfilteredVals[index + 1].match(/^\s*$/);
      if (emptyVal || emptyNextVal) {
        const commaPos = segmentStart + val.length;
        diagnostics.push({
          from: pos.valueStart + commaPos,
          to: pos.valueStart + commaPos + 1, // +1 for comma
          severity: 'error',
          message: translate('general.invalid-syntax'),
          actions: [createDeleteTextAction(translate('editor.remove-comma'))],
        });
      }
    }
    segmentStart += val.length + 1; // +1 for comma delimiter
  }

  return valList;
};

// Returns template, resource type, or null;
const idType = (schema, id) => {
  if (id.startsWith('{{') && id.endsWith('}}')) {
    return 'template';
  }
  const prefix = id.split('_')[0];
  return schema.resourcesByPrefix[prefix];
};

const getChildResourceActions = (schema, parentType) => {
  if (
    !parentType ||
    !schema.childResourceTypesByParentType[parentType]?.length
  ) {
    return [];
  }

  const childTypes = schema.childResourceTypesByParentType[parentType] ?? [];

  return [
    ...new Set(
      childTypes.flatMap((type) => schema.resourcesByType[type]?.actions ?? []),
    ),
  ];
};

const validateIdsField = (
  schema,
  diagnostics,
  idsList,
  validatedFieldsType = {},
  idsPos,
  typePos,
  translate,
) => {
  if (
    idsList.includes('{{.Account.Id}}') &&
    idsList.includes('{{account.id}}')
  ) {
    diagnostics.push({
      from: idsPos.valueStart,
      to: idsPos.valueEnd,
      severity: 'error',
      message: translate('ids.duplicate-template', {
        primary: '{{.Account.Id}}',
        secondary: '{{account.id}}',
      }),
    });
    return;
  }
  if (idsList.includes('{{.User.Id}}') && idsList.includes('{{user.id}}')) {
    diagnostics.push({
      from: idsPos.valueStart,
      to: idsPos.valueEnd,
      severity: 'error',
      message: translate('ids.duplicate-template', {
        primary: '{{.User.Id}}',
        secondary: '{{user.id}}',
      }),
    });
    return;
  }
  let segmentStart = idsPos.valueStart;
  let seenIdType;
  for (const [i, id] of idsList.entries()) {
    let segmentEnd = segmentStart + id.length;
    if (i === 0) {
      seenIdType = idType(schema, id);
    }
    if (i < idsList.length - 1) {
      segmentEnd += 1; // Include comma delimiter for all but last id
    }
    if (idsList.slice(i + 1).includes(id)) {
      diagnostics.push({
        from: segmentStart,
        to: segmentEnd,
        severity: 'error',
        message: translate('ids.duplicate-id', { id }),
        actions: [createDeleteTextAction(translate('editor.remove'))],
      });
      return;
    }
    const currentIdType = idType(schema, id);
    if (currentIdType === 'template') {
      if (!ID_TEMPLATES.includes(id)) {
        diagnostics.push({
          from: segmentStart,
          to: segmentEnd,
          severity: 'error',
          message: translate('ids.unknown-template', { id }),
        });
        return;
      }
    } else {
      if (!currentIdType) {
        diagnostics.push({
          from: segmentStart,
          to: segmentEnd,
          severity: 'error',
          message: translate('ids.invalid-id', { id }),
        });
        return;
      }
    }
    if (currentIdType !== seenIdType) {
      diagnostics.push({
        from: idsPos.valueStart,
        to: idsPos.valueEnd,
        severity: 'error',
        message: translate('ids.mismatched-types', { id }),
      });
      return;
    }
    if (validatedFieldsType.wildcard) {
      // If type is wildcard, then pinned id(s) must support child types
      if (!schema.parentTypes.includes(currentIdType)) {
        diagnostics.push({
          from: idsPos.valueStart,
          to: idsPos.valueEnd,
          severity: 'error',
          message: translate('ids.must-support-child-types', { id }),
        });
        return;
      }
    } else if (validatedFieldsType.value) {
      // If type is known and not wildcard, then pinned id(s) must match the type
      const parentType =
        schema.resourcesByType[validatedFieldsType.value]?.parentType;
      if (!parentType) {
        diagnostics.push({
          from: typePos.valueStart,
          to: typePos.valueEnd,
          severity: 'error',
          message: translate('type.not-child-type', {
            type: validatedFieldsType.value,
          }),
        });
        return;
      }
      if (currentIdType !== parentType) {
        diagnostics.push({
          from: idsPos.valueStart,
          to: idsPos.valueEnd,
          severity: 'error',
          message: translate('ids.must-match-parent-type', {
            id,
            parentType,
          }),
        });
        return;
      }
    }
    segmentStart += id.length + 1; // +1 for comma
  }
  if (seenIdType === 'template') {
    if (idsList.length > 1) {
      seenIdType = 'template-multiple';
    } else if (
      idsList[0] === '{{.Account.Id}}' ||
      idsList[0] === '{{account.id}}'
    ) {
      seenIdType = 'account-template';
    } else if (idsList[0] === '{{.User.Id}}' || idsList[0] === '{{user.id}}') {
      seenIdType = 'user-template';
    }
  }
  return seenIdType;
};

const getIdActionsForResourceType = (schema, resourceType) => {
  switch (resourceType) {
    case 'template-multiple':
      return [
        '*',
        ...schema.resourcesByType['account'].idActions,
        ...schema.resourcesByType['user'].idActions,
      ];
    case 'account-template':
      return ['*', ...schema.resourcesByType['account'].idActions];
    case 'user-template':
      return ['*', ...schema.resourcesByType['user'].idActions];
    default:
      return ['*', ...schema.resourcesByType[resourceType].idActions];
  }
};

const validateActionsField = (
  schema,
  diagnostics,
  actionList,
  validatedFields,
  pos,
  translate,
) => {
  let validActions = schema.validActions;
  let errorMessage = (action) =>
    translate('actions.invalid-action', { action });
  if (!validatedFields.type) {
    if (validatedFields.ids?.knownType) {
      // Only id actions belonging to known id type (including wildcard action)
      validActions = getIdActionsForResourceType(
        schema,
        validatedFields.ids.knownType,
      );
      errorMessage = (action) =>
        translate('actions.id-only', {
          type: validatedFields.ids.knownType,
          action,
        });
    }
  } else if (validatedFields.type.wildcard) {
    if (validatedFields.ids?.knownType) {
      // Any action from associated child resource types would be valid (including wildcard action)
      validActions = [
        '*',
        'no-op',
        ...getChildResourceActions(schema, validatedFields.ids.knownType),
      ];
    }
  } else if (validatedFields.type.value) {
    if (!validatedFields.ids) {
      // Only collection actions create/list belonging to the specified type
      validActions =
        schema.resourcesByType[validatedFields.type.value].collectionActions;
      validActions = validActions.filter(
        (action) => action.startsWith('create') || action.startsWith('list'),
      );
      errorMessage = (action) =>
        translate('actions.collection-only', { action });
    } else if (validatedFields.ids.knownType || validatedFields.ids.wildcard) {
      // Any action belonging to the specified type (including wildcard action)
      validActions = [
        '*',
        'no-op',
        ...schema.resourcesByType[validatedFields.type.value].actions,
      ];
    }
  }

  let segmentStart = pos.valueStart;
  for (const [i, action] of actionList.entries()) {
    let segmentEnd = segmentStart + action.length;
    if (i < actionList.length - 1) {
      segmentEnd += 1; // Include comma delimiter for all but last action
    }
    if (actionList.slice(i + 1).includes(action)) {
      diagnostics.push({
        from: segmentStart,
        to: segmentEnd,
        severity: 'error',
        message: translate('actions.duplicate-action', { action }),
        actions: [createDeleteTextAction(translate('editor.remove'))],
      });
      return;
    }
    if (!validActions.includes(action)) {
      diagnostics.push({
        from: pos.valueStart,
        to: pos.valueEnd,
        severity: 'error',
        message: errorMessage(action),
      });
      return;
    }
    segmentStart += action.length + 1; // +1 for comma
  }

  // no-op should be used with list action or else it has no effect.
  // Also, no-op is not necessary if there is already any other action specified.
  const hasNoOp = actionList.includes('no-op');
  const hasList = actionList.includes('list');
  const hasOtherActions = actionList.some(
    (action) => action !== 'list' && action !== 'no-op',
  );
  if (hasNoOp) {
    if (!hasList) {
      diagnostics.push({
        from: pos.valueStart,
        to: pos.valueEnd,
        severity: 'error',
        message: translate('actions.noop-requires-list'),
      });
      return;
    }
    if (hasOtherActions) {
      diagnostics.push({
        from: pos.valueStart,
        to: pos.valueEnd,
        severity: 'error',
        message: translate('actions.noop-unnecessary'),
      });
      return;
    }
  }
  if (hasList) {
    if (!hasNoOp && !hasOtherActions) {
      diagnostics.push({
        from: pos.valueStart,
        to: pos.valueEnd,
        severity: 'error',
        message: translate('actions.list-requires-noop'),
      });
      return;
    }
  }
};

export const createGrantLinter = (grantsSchema, translate) => {
  const schema = normalizeGrantsSchema(grantsSchema);
  return (context) => grantLinter(context, schema, translate);
};
