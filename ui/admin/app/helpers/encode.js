/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { helper } from '@ember/component/helper';

/**
 * This helper takes a value and converts it to a JSON string.
 * It then encodes the string using base64 encoding.
 *
 * @param {Object} value - The object to be converted to a JSON string.
 * @returns {string} - The base64 encoded JSON string.
 */

export default helper(function encode([value]) {
  if (!value) {
    return '';
  }

  const jsonString = JSON.stringify(value);
  return window.btoa(jsonString);
});
