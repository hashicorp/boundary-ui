/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

/**
 * Takes an array and the current page and pagesize to calculate the correct
 * number of results to return to the caller.
 *
 * @param array
 * @param page
 * @param pageSize
 * @returns {[*]}
 */
export const paginateResults = (array, page, pageSize) => {
  const length = array?.length;
  if (!array || length === 0) {
    return [];
  }
  if (!page || !pageSize) {
    return array;
  }

  const offset = (page - 1) * pageSize;
  const start = Math.min(length - 1, offset);
  const end = Math.min(length, offset + pageSize);

  return array.slice(start, end);
};
