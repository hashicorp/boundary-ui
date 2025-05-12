/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

// created_time is not an attribute defined on all models, but is present in all the resources
// coming from API
const SORT_DEFAULT_ATTRIBUTE = 'created_time';
const SORT_DIRECTION_ASCENDING = 'asc';
const SORT_DIRECTION_DESCENDING = 'desc';

const sortFunctions = {
  string: (a, b) => String(a).localeCompare(String(b)),
  date: (a, b) => new Date(a).getTime() - new Date(b).getTime(),
  number: (a, b) => Number(a) - Number(b),
  boolean: (a, b) => Number(a) - Number(b),
};

function getSortableValue(schema, record, attribute) {
  if (attribute === 'id') {
    return record.id;
  }

  // all models have a created_time attribute but not all models have it defined
  if (attribute === 'created_time') {
    return record.attributes.created_time;
  }

  if (schema.attributes.has(attribute)) {
    return record.attributes[attribute];
  }

  const attributes = Array.from(schema.attributes.keys());
  throw new Error(
    `The attribute "${attribute}" does not map to the model definition of type "${record.type}". Supported sortable attributes are 'id', 'created_time', or ${attributes.map((attr) => `'${attr}'`).join(', ')}`,
  );
}

export const sortResults = (results, { querySort, schema }) => {
  querySort = querySort ?? {};
  const sortAttribute = querySort.attribute || SORT_DEFAULT_ATTRIBUTE;

  // Default sort direction is ascending unless we are sorting by `created_time` (default sort attribute)
  const defaultSortDirection =
    sortAttribute === SORT_DEFAULT_ATTRIBUTE
      ? SORT_DIRECTION_DESCENDING
      : SORT_DIRECTION_ASCENDING;
  const sortDirection = querySort.direction || defaultSortDirection;

  if (
    ![SORT_DIRECTION_ASCENDING, SORT_DIRECTION_DESCENDING].includes(
      sortDirection,
    )
  ) {
    throw new Error('Invalid sort direction');
  }

  const sortAttributeDataType = schema.attributes.get(sortAttribute)?.type;

  const sortFunction =
    sortFunctions[sortAttributeDataType] ?? sortFunctions.string;

  return results.toSorted((a, b) => {
    // Extract the values to sort and sort them.
    const sortValueA = getSortableValue(schema, a, sortAttribute);
    const sortValueB = getSortableValue(schema, b, sortAttribute);
    const sortResult = sortFunction(sortValueA, sortValueB);

    return sortDirection === SORT_DIRECTION_ASCENDING
      ? sortResult
      : -1 * sortResult;
  });
};
