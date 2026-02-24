/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { helper } from '@ember/component/helper';

/**
 * This helper accepts an array of objects and orders them by a specified key.
 * @param {object[]} arr - The array of objects to be ordered
 * @param {string[]} customOrder - The order of keys to be used for sorting
 * @returns {object[]} - New order of array of objects
 */
export default helper(function orderBy([arr, customOrder]) {
  return arr.sort((a, b) => {
    const indexA = customOrder.indexOf(a.key);
    const indexB = customOrder.indexOf(b.key);

    if (indexA === -1 && indexB === -1) {
      return 0; // Maintain original order if both keys are not in the customOrder arr
    } else if (indexA === -1) {
      return 1; // Move b to a higher index if a is not in the customOrder arr
    } else if (indexB === -1) {
      return -1; // Move a to a higher index if b is not in the customOrder arr
    } else {
      return indexA - indexB; // Sort based on the index in the customOrder arr
    }
  });
});
