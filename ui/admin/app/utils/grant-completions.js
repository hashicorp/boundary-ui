/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import {
  GRANT_FIELDS,
  TEMPLATE_RESOURCE_TYPES,
  normalizeGrantsSchema,
  parseGrantLine,
  getValidActions,
  getValidOutputFields,
} from './grant-parser';

const ID_TEMPLATES = ['{{.User.Id}}', '{{.Account.Id}}'];
const CRUDL_ACTIONS = new Set(['create', 'read', 'update', 'delete', 'list']);

const filterByPrefix = (values, partial) =>
  values.filter((value) => value.startsWith(partial));
const parseIds = (idsValue = '') => idsValue.split(',').filter(Boolean);
const withWildCard = (values = []) => ['*', ...new Set(values)];

const getNoSuggestionsOption = (noSuggestionsLabel) => ({
  label: noSuggestionsLabel,
  type: 'text',
  apply: () => {},
});

const parseGrantLineForCompletions = (lineText = '') => {
  const { fields, fieldMap } = parseGrantLine(lineText);

  return {
    parsedFieldNames: fields.map(({ key }) => key),
    idsValue: fieldMap['ids'],
    typeValue: fieldMap['type'],
    actionsValue: fieldMap['actions'],
    outputFieldsValue: fieldMap['output_fields'],
  };
};

const getResourceTypesForId = (schema, id) => {
  const templateType = TEMPLATE_RESOURCE_TYPES[id];
  if (templateType) {
    return [templateType].filter((type) => schema.resourcesByType[type]);
  }

  if (id.includes('_')) {
    const prefix = id.split('_')[0];
    const type = schema.resourceTypesByIdPrefix[prefix];
    return type ? [type] : [];
  }

  return Object.entries(schema.resourceTypesByIdPrefix)
    .filter(([prefix]) => prefix.startsWith(id))
    .map(([, type]) => type);
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

const getTypeOptions = (schema, idsValue, compatibleType) => {
  // If there is no ids value, we can only suggest top-level resource types that have collection actions
  if (!idsValue) {
    return schema.topLevelTypes;
  }

  const hasSpecificIds = Boolean(idsValue) && !idsValue.includes('*');
  if (hasSpecificIds) {
    if (!compatibleType) {
      return [];
    }

    return schema.childResourceTypesByParentType[compatibleType] ?? [];
  }

  // Return the ones that have id based actions (currently only billing doesn't have them)
  return Object.entries(schema.resourcesByType)
    .filter(([, resource]) => resource.idActions.length > 0)
    .map(([type]) => type);
};

export const analyzeGrantString = (grantsSchema, grantString = '') => {
  const schema = normalizeGrantsSchema(grantsSchema);
  const { idsValue, typeValue } = parseGrantLineForCompletions(grantString);

  const hasSpecificIds = Boolean(idsValue) && !idsValue.includes('*');
  const hasExplicitType = Boolean(typeValue) && typeValue !== '*';

  const compatibleIdsResourceType = hasSpecificIds
    ? getCompatibleResourceTypeForIds(schema, idsValue)
    : null;

  const hasInvalidType = hasExplicitType && !schema.resourcesByType[typeValue];
  const hasInvalidIds = hasSpecificIds && !compatibleIdsResourceType;

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
    detectedResourceType = compatibleIdsResourceType;
  }

  const hasWildcardIds = idsValue === '*';
  const crudlOnly = hasWildcardIds && !hasExplicitType;

  const actionOptions =
    idsValue || typeValue
      ? getValidActions(schema, {
          typeValue,
          idsValue,
          idsWildcard: hasWildcardIds,
          idsKnownType: compatibleIdsResourceType,
        }).actions
      : [];
  const actions =
    actionOptions
      .filter(
        (action) => action !== '*' && (!crudlOnly || CRUDL_ACTIONS.has(action)),
      )
      .sort((left, right) => left.localeCompare(right)) ?? [];

  return {
    actions,
    detectedResourceType,
    hasInvalidType,
    hasInvalidIds,
    hasInvalidPinnedIdTypeCombination,
  };
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

  const { parsedFieldNames, idsValue, typeValue } =
    parseGrantLineForCompletions(line.text);
  const compatibleType = idsValue
    ? getCompatibleResourceTypeForIds(schema, idsValue)
    : null;

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
    const matchingTypeOptions = getTypeOptions(
      schema,
      idsValue,
      compatibleType,
    );
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

    const actionOptions = getValidActions(schema, {
      typeValue,
      idsValue,
      idsWildcard: idsValue?.includes('*'),
      idsKnownType: compatibleType,
    }).actions;
    const options = filterByPrefix(actionOptions, partial)
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

    const { outputFields } = getValidOutputFields(schema, {
      typeValue,
      idsKnownType: compatibleType,
    });
    const options = filterByPrefix(outputFields, partial)
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
