/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Helper from '@ember/component/helper';
import { inject as service } from '@ember/service';

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

  translation(year) {
    if (year === 1) {
      return this.intl.t('titles.year');
    } else {
      return this.intl.t('titles.years');
    }
  }
  compute([days]) {
    const remainder = days % 365;
    if (remainder === 0) {
      const numberOfYears = Math.floor(days / 365);
      return numberOfYears + ' ' + this.translation(numberOfYears);
    } else {
      return days + ' ' + this.intl.t('titles.days');
    }
  }
}
