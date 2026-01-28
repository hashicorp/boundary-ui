/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Helper from '@ember/component/helper';
import { service } from '@ember/service';
import { DurationFormat } from '@formatjs/intl-durationformat';
import { secondsToDuration } from 'core/utils/seconds-to-duration';

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
    const durationFormat = new DurationFormat(this.intl.primaryLocale, {
      style: 'narrow',
    });

    return durationFormat.format(secondsToDuration(durationInSeconds));
  }
}
