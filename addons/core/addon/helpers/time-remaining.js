/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import Helper from '@ember/component/helper';
import { service } from '@ember/service';
import { DurationFormat } from '@formatjs/intl-durationformat';
import { secondsToDuration } from 'core/utils/seconds-to-duration';

export default class extends Helper {
  // =services
  @service clockTick;
  @service intl;

  compute([expiration_time]) {
    if (!expiration_time) return;

    // Parse the expiration time
    const expirationTime = new Date(expiration_time);

    // Get the current time
    const currentTime = this.clockTick.now;

    // Calculate the difference in milliseconds
    const difference = expirationTime - currentTime;

    // Calculate the difference in seconds if the difference is positive
    const differenceInSeconds =
      difference > 0 ? Math.floor(difference / 1000) : 0;

    // Format the duration
    const duration = new DurationFormat(this.intl.primaryLocale, {
      style: 'digital',
    });
    const formattedTime = duration.format(
      secondsToDuration(differenceInSeconds),
    );

    return `${formattedTime} ${this.intl.t('resources.session.remaining')}`;
  }
}
