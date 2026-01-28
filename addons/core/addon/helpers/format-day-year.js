/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Helper from '@ember/component/helper';
import { service } from '@ember/service';

/**
 * Takes a `Day` instance and returns in year format if there are no remainders,
 *  * @example
 * {{format-day-year number}}
 *
 **/
export default class extends Helper {
  // =services
  @service intl;

  // =compute method

  /**
   * @param {number} days
   * @return string
   */

  compute([days]) {
    if (days > 0) {
      const remainder = days % 365;
      if (remainder === 0) {
        const numberOfYears = days / 365;
        return this.intl.t('titles.year', { numberOfYears });
      } else {
        return this.intl.t('titles.days', { days });
      }
    }
  }
}
