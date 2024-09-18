/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { helper } from '@ember/component/helper';

/**
 * This helper accepts an array of objects and orders them by a specified key.
 * @param {object[]} arr - The array of objects to be ordered
 * @param {string} keyToShowFirst - The key to be shown first in the order
 * @returns {object[]} - New order of array of objects
 */

export default helper(function orderBy([arr, keyToShowFirst]) {
  return arr.sort((a, b) => {
    if (a.key === keyToShowFirst && b.key !== keyToShowFirst) {
      return -1;
    }
    if (a.key !== keyToShowFirst && b.key === keyToShowFirst) {
      return 1;
    }
    return 0; // Maintain original order if both values are the same or neither matches
  });
});
