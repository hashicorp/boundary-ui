/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Helper from '@ember/component/helper';
import { inject as service } from '@ember/service';
import DurationUnitFormat from 'intl-unofficial-duration-unit-format';

export default class extends Helper {
  // =services
  @service intl;

  // =methods
  /**
   *
   * @param {number} durationInMs Duration in milliseconds
   * @returns localized human-readable duration string. For example, in English "1 hr 23 min 20 sec"
   */
  compute([durationInMs]) {
    const durationInSeconds = durationInMs / 1000;
    const durationFormat = new DurationUnitFormat(this.intl.primaryLocale, {
      style: 'narrow',
      format: '{days} {hours} {minutes} {seconds}',
      round: true,
    });

    return durationFormat.format(durationInSeconds);
  }
}
