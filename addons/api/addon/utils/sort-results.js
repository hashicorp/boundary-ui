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
};

export const sortResults = (results, { querySort, schema }) => {
  // The consumer is already doing this, not sure is necessary
  querySort = querySort ?? {};

  // Why the spike uses an assertion to check the attribute exists? - Ask Chad about it.
  // Perhaps what we should do is throw an error if the attribute does not exists?

  const sortAttribute = querySort.attribute || SORT_DEFAULT_ATTRIBUTE;
  // Default sort direction is ascending unless we are sorting by `created_time` (default sort attribute)
  const defaultSortDirection =
    sortAttribute === SORT_DEFAULT_ATTRIBUTE
      ? SORT_DIRECTION_DESCENDING
      : SORT_DIRECTION_ASCENDING;
  const sortDirection = querySort.direction || defaultSortDirection;

  // Why the spike uses an assertion to check the sort direction is valid with _ASC or _DESC?
  // Perhaps what we should do is throw an error if the direction is not correct?

  const sortAttributeDataType = schema.attributes.get(sortAttribute)?.type;
  // This implementation does not accept the consumer sending a custom sorting function
  // but with small change it can be implemented
  const sortFunction =
    sortFunctions[sortAttributeDataType] ?? sortFunctions.string;

  return results.sort((a, b) => {
    // Extract the values to sort and sort them.
    const sortValueA = a.attributes[sortAttribute];
    const sortValueB = b.attributes[sortAttribute];
    const sortResult = sortFunction(sortValueA, sortValueB);

    return sortDirection === SORT_DIRECTION_ASCENDING
      ? sortResult
      : -1 * sortResult;
  });
};
