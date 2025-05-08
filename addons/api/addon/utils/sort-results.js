/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

// created_time is not an attribute defined in models per se, but present in
// all the resources coming from API. It is the default sorting attribute
const SORT_DEFAULT_ATTRIBUTE = 'created_time';
const SORT_DIRECTION_ASCENDING = 'asc';
const SORT_DIRECTION_DESCENDING = 'desc';

const sortFunctions = {
  string: (a, b) => String(a).localeCompare(String(b)),
  date: (a, b) => new Date(a).getTime() - new Date(b).getTime(),
  number: (a, b) => Number(a) - Number(b),
  boolean: (a, b) => Number(a) - Number(b),
};

const getSortValue = (sortValue, sortAttribute) => {
  if (
    sortValue.attributes &&
    Object.hasOwn(sortValue.attributes, sortAttribute)
  ) {
    return sortValue.attributes[sortAttribute];
  } else if (Object.hasOwn(sortValue, sortAttribute)) {
    return sortValue[sortAttribute];
  } else {
    throw new Error('The attribute you are trying to sortBy does not exists');
  }
};

export const sortResults = (results, { querySort, schema }) => {
  querySort = querySort ?? {};

  // ToDo: Validate checkquerySort.attribute with assertion

  const sortAttribute = querySort.attribute || SORT_DEFAULT_ATTRIBUTE;
  // Default sort direction is ascending unless we are sorting by `created_time` (default sort attribute)
  const defaultSortDirection =
    sortAttribute === SORT_DEFAULT_ATTRIBUTE
      ? SORT_DIRECTION_DESCENDING
      : SORT_DIRECTION_ASCENDING;
  const sortDirection = querySort.direction || defaultSortDirection;

  // ToDo: Check sortDirection is valid with assert
  const sortAttributeDataType = schema.attributes.get(sortAttribute)?.type;

  const sortFunction =
    sortFunctions[sortAttributeDataType] ?? sortFunctions.string;

  return results.toSorted((a, b) => {
    // Extract the values to sort and sort them.
    const sortValueA = getSortValue(a, sortAttribute);
    const sortValueB = getSortValue(b, sortAttribute);
    const sortResult = sortFunction(sortValueA, sortValueB);

    return sortDirection === SORT_DIRECTION_ASCENDING
      ? sortResult
      : -1 * sortResult;
  });
};
