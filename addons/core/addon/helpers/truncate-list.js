/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

/**
 * Use this helper to truncate the list if there are more items than the limit specified
 *
 * @example
 *
 * {{truncate-list array limit}}
 */

import Helper from '@ember/component/helper';
import { service } from '@ember/service';

export default class extends Helper {
  // =services
  @service intl;

  // =compute method

  /**
   * This helper truncates the list if there are more items than the limit specified
   * and returns the original list appended with +N remaining items
   * @param {array} list List of items
   * @return string
   */

  compute([translation, list, limit = 3]) {
    if (list) {
      const numberOfItems = Object.keys(list).length;
      const items = list.map(({ value }) => value);
      if (numberOfItems > limit) {
        const remainingItems = items.splice(limit).length;
        return items.join(', ') + this.intl.t(translation, { remainingItems });
      } else {
        return items.join(', ');
      }
    }
  }
}
