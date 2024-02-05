/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import _debounce from 'lodash/debounce';

/**
 * Decorates a method whereby calls to the method will be debounced.
 * @param timeToWait
 * @param options
 */
export function debounce(timeToWait, options) {
  return function (_target, _propertyKey, desc) {
    const method = desc.value;

    // Use a normal function to get the correct `this` for the function caller
    desc.value = _debounce(
      async function () {
        return method.apply(this, arguments);
      },
      timeToWait,
      options,
    );
  };
}
