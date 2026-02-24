/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Helper from '@ember/component/helper';
import { service } from '@ember/service';

export function reverseIndexedDisplayName(intl, translation, array, item) {
  const length = array.length;
  const position = array.indexOf(item);
  let index = length - position;

  // indexOf will return -1 if item not in array; if item not found
  // in array index set to null to avoid displaying incorrect index
  if (position === -1) {
    index = null;
  }

  return intl.t(translation, { index });
}

export default class ReverseIndexedDisplayName extends Helper {
  // =services
  @service intl;

  // =methods
  /**
   *
   * @param {string} translation
   * @param {Array} array parent array of item
   * @param {object} item object that you want to find the index of
   * indexOf will not do a deep equality check with item, just if the object exist in the array
   * @returns localized name for resource with indexed position. For example, "Channel 1" for last item in a list.
   */
  compute([translation, array, item]) {
    return reverseIndexedDisplayName(this.intl, translation, array, item);
  }
}
