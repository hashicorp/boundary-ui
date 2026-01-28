/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { helper } from '@ember/component/helper';

const groupByReducer = (items, key) => {
  const obj = items.reduce((result, item) => {
    if (!result[item[key]]) result[item[key]] = { key: item[key], items: [] };
    result[item[key]].items.push(item);
    return result;
  }, {});
  // Convert object group to an array for iteration
  const arr = Object.keys(obj).map((key) => obj[key]);
  return arr;
};

/**
 * This helper accepts an array of objects and groups them by a specified key.
 * It returns a new array of objects in the form [{ key, items }], where `key`
 * is the value of the specified key and `items` is an array of matching items.
 * @param {object[]} items
 * @param {string} key
 */
export default helper(function groupBy([items, key]) {
  const result = groupByReducer(items, key);
  return result;
});
