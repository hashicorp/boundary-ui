/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

const GRANT_FIELDS = ['ids', 'type', 'actions', 'output_fields'];
const ID_TEMPLATES = ['{{.User.Id}}', '{{.Account.Id}}'];
const filterByPrefix = (values, partial) =>
  values.filter((value) => value.startsWith(partial));
const withWildCard = (values = []) => ['*', ...new Set(values)];
const parseIds = (idsValue = '') => idsValue.split(',').filter(Boolean);

const getNoSuggestionsOption = (noSuggestionsLabel) => ({
  label: noSuggestionsLabel,
  type: 'text',
  apply: () => {},
  boost: -99,
});

const parseGrantFields = (lineText) =>
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

const getResourceTypesForId = (schema, id) =>
  id.includes('_')
    ? [
        schema.resourceTypesByIdPrefix.find(
          ({ idPrefix }) => id.split('_')[0] === idPrefix,
        )?.type,
      ].filter(Boolean)
    : schema.resourceTypesByIdPrefix
        .filter(({ idPrefix }) => id.startsWith(idPrefix))
        .map(({ type }) => type);

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

const getChildResourceActions = (schema, idsValue) => {
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
      childTypes.flatMap((type) => schema.resourcesByType[type]?.actions ?? []),
    ),
  ];
};

const getTypeOptions = (schema, idsValue) => {
  // If there is no ids value, we can only suggest top-level resource types that have collection actions
  if (!idsValue) {
    return schema.resourceTypes
      .filter(
        (resource) =>
          !resource.parent_type && resource.collection_actions?.length > 0,
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

    if (
      !selectedResource ||
      !(getCompatibleResourceTypeForIds(schema, idsValue) === typeValue)
    ) {
      return [];
    }

    return withWildCard(selectedResource.actions);
  }

  // Should be wildcard IDs with a specific type, so show all actions for that type
  return selectedResource
    ? withWildCard(selectedResource.actions)
    : actionOptions;
};

function grantCompletions(context, schema, noSuggestionsLabel) {
  const line = context.state.doc.lineAt(context.pos);
  const beforeCursor = line.text.slice(0, context.pos - line.from);

  const parsedFields = parseGrantFields(line.text);
  const parsedFieldNames = parsedFields.map(({ fieldName }) => fieldName);

  const idsValue = parsedFields.find(
    ({ fieldName }) => fieldName === 'ids',
  )?.fieldValue;
  const typeValue = parsedFields.find(
    ({ fieldName }) => fieldName === 'type',
  )?.fieldValue;

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
    }));

    return {
      from: context.pos - partial.length,
      options: options.length
        ? options
        : [getNoSuggestionsOption(noSuggestionsLabel)],
      filter: options.length > 0,
    };
  }

  const idsValueMatch = beforeCursor.match(/ids=([a-z0-9_*.{},-]*)$/);
  if (idsValueMatch) {
    const enteredIds = idsValueMatch[1].split(',');
    const partial = enteredIds.pop() ?? '';
    const hasEnteredIds = enteredIds.length > 0;
    // TODO: Add loaded ID suggestions here? Logic below will change

    return {
      from: context.pos - partial.length,
      options: filterByPrefix(['*', ...ID_TEMPLATES], partial)
        .filter((value) => !hasEnteredIds || value !== '*')
        .filter((value) => !enteredIds.includes(value))
        .map((value) => ({
          label: value,
          type: 'constant',
          info: value === '*' ? 'Wildcard - matches all IDs' : 'Template value',
        })),
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
        type: 'function',
      }));

    return {
      from: context.pos - partial.length,
      options: options.length
        ? options
        : [getNoSuggestionsOption(noSuggestionsLabel)],
      filter: options.length > 0,
    };
  }

  const outputFieldsMatch = beforeCursor.match(
    /output_fields=([a-z0-9_,*-]*)$/,
  );

  if (outputFieldsMatch) {
    const enteredOutputFields = outputFieldsMatch[1].split(',');
    const partial = enteredOutputFields.pop() ?? '';
    const hasEnteredOutputFields = enteredOutputFields.length > 0;

    return {
      from: context.pos - partial.length,
      options: filterByPrefix(['*'], partial)
        .filter((value) => !hasEnteredOutputFields || value !== '*')
        .map((value) => ({
          label: value,
          type: 'constant',
          apply: value,
          info: 'All fields',
        })),
    };
  }

  return null;
}

export const createGrantCompletionSource = (
  grantsSchema,
  noSuggestionsLabel,
) => {
  const schema = normalizeGrantsSchema(grantsSchema);

  return (context) => grantCompletions(context, schema, noSuggestionsLabel);
};
