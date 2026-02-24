/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

/**
 * Takes an object and gets the JSON stringified version of it to be converted
 * to a hash code. Taken from https://stackoverflow.com/a/8076436
 * @param obj
 */
export const hashCode = (obj) => {
  if (!obj) {
    return 0;
  }

  // Use a replacer function to sort the keys of the object so we get the same hashcode
  // regardless of the order of the keys.
  const jsonString = JSON.stringify(obj, Object.keys(obj).sort());

  let hash = 0;
  for (let i = 0; i < jsonString.length; i++) {
    let code = jsonString.charCodeAt(i);
    hash = (hash << 5) - hash + code;
    hash = hash & hash; // Convert to 32bit integer
  }

  // Make sure the hash is positive since we're using it as an ID
  return Math.abs(hash);
};
