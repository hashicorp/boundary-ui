/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

/**
 * Flattens a nested object into a single-level object.
 * @param obj
 * @param result
 * @returns {Object}
 */

export const flattenObject = (obj, result = {}) => {
  for (const key in obj) {
    // Skip the 'metadata' key
    if (key === 'metadata') {
      continue;
    }
    // Check if the value is an object and it is not null
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      // Recursively flatten the object
      flattenObject(obj[key], result);
    } else if (obj[key]) {
      // Only add to result if the value is not null
      result[key] = obj[key];
    }
  }
  return result;
};
