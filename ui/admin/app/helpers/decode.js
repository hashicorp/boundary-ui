/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { helper } from '@ember/component/helper';

/**
 * This helper takes a base64 encoded string and decodes it.
 * It then parses the decoded string as JSON.
 * @param {Object} value -  The encoded string to be decoded.
 * @returns {string} - The base64 decoded JSON string.
 */

export default helper(function decode([value]) {
  if (!value) {
    return '';
  }
  // if the value is an array, decode each item
  if (Array.isArray(value)) {
    return value.map((item) => {
      return JSON.parse(window.atob(item.id));
    });
  }

  return JSON.parse(window.atob(value.id));
});
