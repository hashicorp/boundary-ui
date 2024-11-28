/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */
import { typeOf } from '@ember/utils';

/**
 * Flattens a nested object into a single-level object.
 * @param obj
 * @param result
 * @param parentKey
 * @returns {Object}
 */

export const flattenObject = (obj, result = {}, parentKey = '') => {
  for (const key in obj) {
    // Check if the value is an object and it is not null
    if (typeOf(obj[key]) === 'object' && obj[key] !== null) {
      // Recursively flatten the object
      flattenObject(obj[key], result, `${parentKey}${key}.`);
    } else if (obj[key]) {
      // Only add to result if the value is not null
      result[`${parentKey}${key}`] = obj[key];
    }
  }
  return result;
};
