/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

/**
 * Flattens a nested object into a single-level object.
 * @param obj
 * @param parentKey
 * @param result
 * @returns {Object}
 */

export const flattenObject = (obj, parentKey = '', result = {}) => {
  for (const key in obj) {
    // Create a new key for the nested property
    const newKey = parentKey ? `${parentKey}.${key}` : key;
    // Check if the value is an object and not null
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      // Recursively flatten the object
      flattenObject(obj[key], newKey, result);
    } else if (obj[key]) {
      // Only add to result if the value is not null
      result[newKey] = obj[key];
    }
  }
  return result;
};
