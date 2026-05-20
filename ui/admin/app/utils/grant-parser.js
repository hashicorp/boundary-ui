/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

export const GRANT_FIELDS = ['ids', 'type', 'actions', 'output_fields'];
export const TEMPLATE_RESOURCE_TYPES = {
  '{{.User.Id}}': 'user',
  '{{.Account.Id}}': 'account',
  '{{user.id}}': 'user',
  '{{account.id}}': 'account',
};

export const normalizeGrantsSchema = (grantsSchema) => {
  const resourceTypes = grantsSchema?.resource_types ?? [];

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

  const validResourceTypes = resourceTypes.map((resource) => resource.type);
  validResourceTypes.push('*');

  const allActions = new Set();
  Object.values(resourcesByType).forEach((resource) => {
    resource.actions.forEach((action) => allActions.add(action));
  });
  const validActions = Array.from(allActions);

  const resourceTypesByIdPrefix = resourceTypes.reduce((map, resource) => {
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
    resourceTypesByIdPrefix,
    childResourceTypesByParentType,
    parentTypes,
    topLevelTypes,
    validResourceTypes,
    validActions,
  };
};

export const parseGrantLine = (lineText = '', lineStart = 0) => {
  const pairs = lineText.split(';').filter((p) => p.trim());

  const fields = [];
  const fieldMap = {};
  const fieldPositions = {};
  const fieldKeyCount = {};

  let pairOffset = 0;

  for (const pair of pairs) {
    const pairInLine = lineText.indexOf(pair, pairOffset);
    const [key, ...valueParts] = pair.split('=');
    const value = valueParts.join('=');

    const trimmedKey = key.trim();
    const keyStartInPair = pair.indexOf(trimmedKey);
    const valueStartInPair = pair.indexOf('=') + 1;

    const pos = {
      keyStart: lineStart + pairInLine + keyStartInPair,
      valueStart: lineStart + pairInLine + valueStartInPair,
      valueEnd: lineStart + pairInLine + pair.length,
    };

    const hasValue = valueParts.length > 0;

    fields.push({
      key: trimmedKey,
      value: hasValue ? value.trim() : undefined,
      pos,
    });
    fieldKeyCount[trimmedKey] = (fieldKeyCount[trimmedKey] ?? 0) + 1;

    if (hasValue && trimmedKey) {
      fieldPositions[trimmedKey] = pos;
      const trimmedValue = value.trim();
      if (trimmedValue) {
        fieldMap[trimmedKey] = trimmedValue;
      }
    }

    pairOffset = pairInLine + pair.length + 1;
  }

  return { fields, fieldMap, fieldPositions, fieldKeyCount };
};

export const getChildResourceValues = (schema, compatibleType, getValues) => {
  if (
    !compatibleType ||
    !schema.childResourceTypesByParentType[compatibleType]?.length
  ) {
    return [];
  }

  const childTypes =
    schema.childResourceTypesByParentType[compatibleType] ?? [];

  return [
    ...new Set(
      childTypes.flatMap((type) => getValues(schema.resourcesByType[type])),
    ),
  ];
};

export const getChildResourceActions = (schema, compatibleType) =>
  getChildResourceValues(
    schema,
    compatibleType,
    (resource) => resource?.actions ?? [],
  );

export const getChildResourceOutputFields = (schema, compatibleType) =>
  getChildResourceValues(
    schema,
    compatibleType,
    (resource) => resource?.outputFields ?? [],
  );

export const withWildCard = (values = []) => ['*', ...new Set(values)];

export const getValidActions = (
  schema,
  { typeValue, idsValue, idsWildcard, idsKnownType },
) => {
  const typeWildcard = typeValue === '*';
  const hasExplicitType = Boolean(typeValue) && !typeWildcard;
  const hasIds = Boolean(idsValue);

  if (!typeValue) {
    if (hasIds) {
      if (idsKnownType) {
        return {
          actionsType: 'id',
          actions: withWildCard(
            schema.resourcesByType[idsKnownType]?.idActions ?? [],
          ),
        };
      }
      if (idsWildcard) {
        return {
          actionsType: 'all',
          actions: withWildCard(schema.validActions),
        };
      }
    } else {
      return { actionsType: 'all', actions: withWildCard(schema.validActions) };
    }
  } else if (typeWildcard) {
    if (hasIds) {
      if (idsKnownType) {
        return {
          actionsType: 'child',
          actions: withWildCard(getChildResourceActions(schema, idsKnownType)),
        };
      }
      if (idsWildcard) {
        return {
          actionsType: 'all',
          actions: withWildCard(schema.validActions),
        };
      }
    }
  } else if (hasExplicitType) {
    if (hasIds) {
      if (idsKnownType) {
        const selectedResource = schema.resourcesByType[typeValue];
        if (selectedResource?.parentType !== idsKnownType) {
          return { actionsType: 'invalid', actions: [] };
        }
        return {
          actionsType: 'type',
          actions: withWildCard(
            schema.resourcesByType[typeValue]?.actions ?? [],
          ),
        };
      }
      if (idsWildcard) {
        return {
          actionsType: 'type',
          actions: withWildCard(
            schema.resourcesByType[typeValue]?.actions ?? [],
          ),
        };
      }
    } else {
      if (schema.topLevelTypes.includes(typeValue)) {
        return {
          actionsType: 'collection',
          actions: schema.resourcesByType[typeValue]?.collectionActions ?? [],
        };
      }
    }
  }

  return { actionsType: 'invalid', actions: [] };
};
