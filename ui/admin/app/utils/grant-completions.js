/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

const GRANT_FIELDS = ['ids', 'type', 'actions', 'output_fields'];
const ID_TEMPLATES = ['{{.User.Id}}', '{{.Account.Id}}'];
const CRUDL_ACTIONS = new Set(['create', 'read', 'update', 'delete', 'list']);
const TEMPLATE_RESOURCE_TYPES = {
  '{{.User.Id}}': 'user',
  '{{.Account.Id}}': 'account',
  '{{user.id}}': 'user',
  '{{account.id}}': 'account',
};
const filterByPrefix = (values, partial) =>
  values.filter((value) => value.startsWith(partial));
const withWildCard = (values = []) => ['*', ...new Set(values)];
const parseIds = (idsValue = '') => idsValue.split(',').filter(Boolean);

const getNoSuggestionsOption = (noSuggestionsLabel) => ({
  label: noSuggestionsLabel,
  type: 'text',
  apply: () => {},
});

const parseGrantFields = (lineText = '') =>
  lineText
    .split(';')
    .map((pair) => {
      const [fieldName, ...valueParts] = pair.split('=');

      // There should only be one '=' in a valid pair, but if there are more,
      // we'll keep the value parts together and let the user know it's
      // invalid through validation rather than breaking the parsing
      return {
        fieldName: fieldName,
        fieldValue: valueParts.join('='),
      };
    })
    .filter(({ fieldName }) => fieldName);

const getGrantFieldValue = (parsedFields, targetFieldName) =>
  parsedFields.find(({ fieldName }) => fieldName === targetFieldName)
    ?.fieldValue;

const parseGrantLine = (lineText = '') => {
  const parsedFields = parseGrantFields(lineText);

  return {
    parsedFields,
    idsValue: getGrantFieldValue(parsedFields, 'ids'),
    typeValue: getGrantFieldValue(parsedFields, 'type'),
    actionsValue: getGrantFieldValue(parsedFields, 'actions'),
    outputFieldsValue: getGrantFieldValue(parsedFields, 'output_fields'),
  };
};

export const normalizeGrantsSchema = (grantsSchema) => {
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
      outputFields: resourceType.output_fields ?? [],
    };

    return resources;
  }, {});

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

  const resourceTypesByIdPrefix = resourceTypes.flatMap((resourceType) =>
    (resourceType.id_prefixes ?? []).map((idPrefix) => ({
      idPrefix,
      type: resourceType.type,
    })),
  );

  return {
    resourceTypes,
    resourcesByType,
    childResourceTypesByParentType,
    resourceTypesByIdPrefix,
  };
};

const getResourceTypesForId = (schema, id) => {
  const templateType = TEMPLATE_RESOURCE_TYPES[id];
  if (templateType) {
    return [templateType].filter((type) => schema.resourcesByType[type]);
  }

  return id.includes('_')
    ? [
        schema.resourceTypesByIdPrefix.find(
          ({ idPrefix }) => id.split('_')[0] === idPrefix,
        )?.type,
      ].filter(Boolean)
    : schema.resourceTypesByIdPrefix
        .filter(({ idPrefix }) => idPrefix.startsWith(id))
        .map(({ type }) => type);
};

const getCompatibleResourceTypeForIds = (schema, idsValue) => {
  const resourceTypesById = parseIds(idsValue).flatMap((id) =>
    getResourceTypesForId(schema, id),
  );
  const [firstResourceType] = resourceTypesById;

  if (
    !firstResourceType ||
    !resourceTypesById.every(
      (resourceType) => firstResourceType === resourceType,
    )
  ) {
    return null;
  }

  return firstResourceType;
};

const getIdActions = (schema, idsValue) => {
  const matchedType = getCompatibleResourceTypeForIds(schema, idsValue);

  if (!matchedType) {
    return [];
  }

  return schema.resourcesByType[matchedType]?.idActions;
};

const getChildResourceValues = (schema, idsValue, getValues) => {
  const parentType = getCompatibleResourceTypeForIds(schema, idsValue);

  if (
    !parentType ||
    !schema.childResourceTypesByParentType[parentType]?.length
  ) {
    return [];
  }

  const childTypes = schema.childResourceTypesByParentType[parentType] ?? [];

  return [
    ...new Set(
      childTypes.flatMap((type) => getValues(schema.resourcesByType[type])),
    ),
  ];
};

const getChildResourceActions = (schema, idsValue) =>
  getChildResourceValues(
    schema,
    idsValue,
    (resource) => resource?.actions ?? [],
  );

const getChildResourceOutputFields = (schema, idsValue) =>
  getChildResourceValues(
    schema,
    idsValue,
    (resource) => resource?.outputFields ?? [],
  );

const getTypeOptions = (schema, idsValue) => {
  // If there is no ids value, we can only suggest top-level resource types that have collection actions
  if (!idsValue) {
    return schema.resourceTypes
      .filter(
        (resource) =>
          !resource.parent_type &&
          resource.collection_actions.some(
            (action) => action === 'list' || action === 'create',
          ),
      )
      .map((resource) => resource.type);
  }

  const hasSpecificIds = Boolean(idsValue) && !idsValue.includes('*');
  if (hasSpecificIds) {
    const parentType = getCompatibleResourceTypeForIds(schema, idsValue);

    if (!parentType) {
      return [];
    }

    return schema.childResourceTypesByParentType[parentType] ?? [];
  }

  // Return the ones that have id based actions (currently only billing doesn't have them)
  return schema.resourceTypes
    .filter((resource) => resource.id_actions?.length > 0)
    .map((resource) => resource.type);
};

const getActionOptions = (schema, typeValue, idsValue) => {
  const actionOptions = withWildCard(
    Object.values(schema.resourcesByType).flatMap(({ actions }) => actions),
  );

  const hasSpecificIds = Boolean(idsValue) && !idsValue.includes('*');
  const hasOnlyType = Boolean(typeValue) && !idsValue;
  const selectedResource = schema.resourcesByType[typeValue];

  // Just show ID specific actions as collection actions are invalid here
  if (!typeValue && hasSpecificIds) {
    const idActions = getIdActions(schema, idsValue);
    return idActions.length ? withWildCard(idActions) : [];
  }

  if (!typeValue || (typeValue === '*' && idsValue === '*')) {
    return actionOptions;
  }

  if (hasOnlyType) {
    if (selectedResource?.parentType) {
      return [];
    }

    return selectedResource?.collectionActions ?? [];
  }

  if (hasSpecificIds) {
    // These are pinned IDs with a wildcard type
    if (typeValue === '*') {
      const childResourceActions = getChildResourceActions(schema, idsValue);

      return childResourceActions.length
        ? withWildCard(childResourceActions)
        : [];
    }

    const matchedType = getCompatibleResourceTypeForIds(schema, idsValue);
    const isSelectedChildType = (
      schema.childResourceTypesByParentType[matchedType] ?? []
    ).includes(typeValue);

    // A specific ID paired with its own type is not a valid combination.
    // For pinned IDs, only child types are valid.
    if (!selectedResource || !isSelectedChildType) {
      return [];
    }

    // Return all the actions for the selected type from a pinned ID
    return withWildCard([
      ...selectedResource.collectionActions,
      ...selectedResource.idActions,
    ]);
  }

  // Should be wildcard IDs with a specific type, so show all actions for that type
  return selectedResource ? withWildCard(selectedResource.actions) : [];
};

export const analyzeGrantString = (grantsSchema, grantString = '') => {
  const schema = normalizeGrantsSchema(grantsSchema);
  const { idsValue, typeValue } = parseGrantLine(grantString);

  const hasSpecificIds = Boolean(idsValue) && !idsValue.includes('*');
  const hasExplicitType = Boolean(typeValue) && typeValue !== '*';

  const hasTemplateIds =
    hasSpecificIds &&
    parseIds(idsValue).some((id) => id.startsWith('{{') && id.endsWith('}}'));

  const hasLiteralIds = hasSpecificIds && !hasTemplateIds;

  const compatibleIdsResourceType = hasLiteralIds
    ? getCompatibleResourceTypeForIds(schema, idsValue)
    : null;

  const hasInvalidType = hasExplicitType && !schema.resourcesByType[typeValue];
  const hasInvalidIds = hasLiteralIds && !compatibleIdsResourceType;

  const hasInvalidPinnedIdTypeCombination =
    hasSpecificIds &&
    hasExplicitType &&
    !hasInvalidIds &&
    !hasInvalidType &&
    !(
      schema.childResourceTypesByParentType[compatibleIdsResourceType] ?? []
    ).includes(typeValue);

  let detectedResourceType = null;
  if (typeValue && typeValue !== '*') {
    // Explicit type specified, use it directly
    detectedResourceType = typeValue;
  } else if (compatibleIdsResourceType && typeValue === '*') {
    // Pinned IDs with wildcard type, return the child resource types
    const childTypes =
      schema.childResourceTypesByParentType[compatibleIdsResourceType] ?? [];
    detectedResourceType = childTypes.length ? childTypes : null;
  } else if (typeValue !== '*' && idsValue) {
    // No type field, infer resource type from the ID prefix
    detectedResourceType = getCompatibleResourceTypeForIds(schema, idsValue);
  }

  const hasWildcardIds = idsValue === '*';
  const crudlOnly = hasWildcardIds && !hasExplicitType;

  const actions =
    idsValue || typeValue
      ? getActionOptions(schema, typeValue, idsValue)
          .filter(
            (action) =>
              action !== '*' && (!crudlOnly || CRUDL_ACTIONS.has(action)),
          )
          .sort((left, right) => left.localeCompare(right))
      : [];

  return {
    actions,
    detectedResourceType,
    hasInvalidType,
    hasInvalidIds,
    hasInvalidPinnedIdTypeCombination,
  };
};

const getOutputFieldOptions = (schema, typeValue, idsValue) => {
  const selectedResource = schema.resourcesByType[typeValue];

  if (typeValue && typeValue !== '*' && selectedResource) {
    return selectedResource.outputFields.length
      ? withWildCard(selectedResource.outputFields)
      : ['*'];
  }

  const hasSpecificIds = Boolean(idsValue) && !idsValue.includes('*');

  // Pinned IDs with wildcard type
  if (typeValue === '*' && hasSpecificIds) {
    const childOutputFields = getChildResourceOutputFields(schema, idsValue);
    return childOutputFields.length ? withWildCard(childOutputFields) : ['*'];
  }

  if (!typeValue && hasSpecificIds) {
    const matchedType = getCompatibleResourceTypeForIds(schema, idsValue);
    if (matchedType) {
      const resourceOutputFields =
        schema.resourcesByType[matchedType]?.outputFields ?? [];
      return resourceOutputFields.length
        ? withWildCard(resourceOutputFields)
        : ['*'];
    }
  }

  return ['*'];
};

const getIdLookupTypes = (schema, typeValue, enteredIds) => {
  if (enteredIds.length > 0) {
    const compatibleResourceType = getCompatibleResourceTypeForIds(
      schema,
      enteredIds.join(','),
    );
    // No valid suggestions if there are mixed resource types across entered IDs
    return compatibleResourceType ? [compatibleResourceType] : [];
  }

  if (typeValue === '*') {
    // Only parent resource IDs (those that have child types) are useful
    return Object.keys(schema.childResourceTypesByParentType);
  }

  if (typeValue) {
    const parentType = schema.resourcesByType[typeValue]?.parentType;
    // Restrict to the parent's IDs otherwise there are no valid ID suggestions besides wildcard
    return parentType ? [parentType] : [];
  }

  // All types are potentially valid
  return null;
};

async function grantCompletions(
  context,
  schema,
  translate,
  idLookup,
  getIsLoading,
) {
  const line = context.state.doc.lineAt(context.pos);
  const beforeCursor = line.text.slice(0, context.pos - line.from);

  const { parsedFields, idsValue, typeValue } = parseGrantLine(line.text);
  const parsedFieldNames = parsedFields.map(({ fieldName }) => fieldName);

  // Check if we're typing a field name (e.g. "type=") by starting at the beginning or after a semicolon.
  // This allows us to provide field name suggestions when the user is typing a new field
  // and restrict suggestions to only fields that haven't been used yet in the current line
  const fieldNameMatch = beforeCursor.match(/(?:^|;)([a-z_]*)$/);
  if (fieldNameMatch) {
    const partial = fieldNameMatch[1];
    const options = filterByPrefix(
      GRANT_FIELDS.filter((field) => !parsedFieldNames.includes(field)),
      partial,
    ).map((field) => ({
      label: `${field}=`,
      type: 'keyword',
    }));

    return {
      from: context.pos - partial.length,
      options,
      filter: false, // This is to preserve the original order of our array and not let codemirror sort it
    };
  }

  // Check if we're providing a value for the "type" field
  const typeValueMatch = beforeCursor.match(/type=([a-z-*]*)$/);
  if (typeValueMatch) {
    const partial = typeValueMatch[1];
    const matchingTypeOptions = getTypeOptions(schema, idsValue);
    const typeOptions =
      partial === '' && matchingTypeOptions.length
        ? withWildCard(matchingTypeOptions)
        : matchingTypeOptions;
    const options = filterByPrefix(typeOptions, partial).map((type) => ({
      label: type,
      type: 'type',
      info: type === '*' ? translate('wildcard-types') : '',
    }));

    return {
      from: context.pos - partial.length,
      options: options.length
        ? options
        : [getNoSuggestionsOption(translate('no-suggestions'))],
    };
  }

  const idsValueMatch = beforeCursor.match(/ids=([\w*.{},\s-]*)$/);
  if (idsValueMatch) {
    const enteredIds = idsValueMatch[1].split(',');
    const partial = enteredIds.pop() ?? '';
    const hasEnteredIds = enteredIds.length > 0;
    const hasEnteredTemplateIds = enteredIds.some((id) => id.startsWith('{{'));

    const staticOptions = filterByPrefix(['*', ...ID_TEMPLATES], partial)
      .filter((value) => !hasEnteredIds || value !== '*')
      .filter(
        (value) =>
          (!hasEnteredIds && !typeValue) || !ID_TEMPLATES.includes(value),
      )
      .filter((value) => !enteredIds.includes(value))
      .map((value) => ({
        label: value,
        type: value === '*' ? 'constant' : 'interface',
        info:
          value === '*'
            ? translate('wildcard-ids')
            : translate('template-value'),
      }));

    const compatibleResourceTypes = getIdLookupTypes(
      schema,
      typeValue,
      enteredIds,
    );
    const from = context.pos - partial.length;

    const ids = hasEnteredTemplateIds
      ? []
      : await idLookup(partial, compatibleResourceTypes);
    const idOptions = ids
      .filter(({ id }) => !enteredIds.includes(id))
      .map(({ id, name }) => ({
        label: id,
        detail: name,
        type: 'variable',
      }));

    const allOptions = [...staticOptions, ...idOptions];

    // Show a loading placeholder when IDs are still being fetched in the background
    if (getIsLoading()) {
      allOptions.push({
        label: translate('loading-ids'),
        type: 'text',
        apply: () => {},
      });
    }

    return {
      from,
      options: allOptions.length
        ? allOptions
        : [getNoSuggestionsOption(translate('no-suggestions'))],
      // We do our own filtering via DB search, so disable CodeMirror's
      // built-in filtering. Without this, name-based searches are dropped
      // because the label (the ID) doesn't match the typed text (the name).
      filter: false,
    };
  }

  const actionsValueMatch = beforeCursor.match(/actions=([a-z0-9_:,*-]*)$/);

  if (actionsValueMatch) {
    const enteredActions = actionsValueMatch[1].split(',');
    const partial = enteredActions.pop() ?? '';
    const hasEnteredActions = enteredActions.length > 0;

    const options = filterByPrefix(
      getActionOptions(schema, typeValue, idsValue),
      partial,
    )
      .filter((action) => !hasEnteredActions || action !== '*')
      .filter((action) => !enteredActions.includes(action))
      .map((action) => ({
        label: action,
        type: 'constant',
        info: action === '*' ? translate('wildcard-actions') : '',
      }));

    return {
      from: context.pos - partial.length,
      options: options.length
        ? options
        : [getNoSuggestionsOption(translate('no-suggestions'))],
    };
  }

  const outputFieldsMatch = beforeCursor.match(
    /output_fields=([a-z0-9_,*-]*)$/,
  );

  if (outputFieldsMatch) {
    const enteredOutputFields = outputFieldsMatch[1].split(',');
    const partial = enteredOutputFields.pop() ?? '';
    const hasEnteredOutputFields = enteredOutputFields.length > 0;

    const options = filterByPrefix(
      getOutputFieldOptions(schema, typeValue, idsValue),
      partial,
    )
      .filter((value) => !hasEnteredOutputFields || value !== '*')
      .filter((value) => !enteredOutputFields.includes(value))
      .map((value) => ({
        label: value,
        type: 'constant',
        info: value === '*' ? translate('all-fields') : '',
      }));

    return {
      from: context.pos - partial.length,
      options: options.length
        ? options
        : [getNoSuggestionsOption(translate('no-suggestions'))],
    };
  }

  return null;
}

export const createGrantCompletionSource = (
  grantsSchema,
  translate,
  idLookup,
  getIsLoading,
) => {
  const schema = normalizeGrantsSchema(grantsSchema);

  return (context) =>
    grantCompletions(context, schema, translate, idLookup, getIsLoading);
};
