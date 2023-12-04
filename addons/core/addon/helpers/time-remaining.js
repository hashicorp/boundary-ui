/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Helper from '@ember/component/helper';
import { inject as service } from '@ember/service';
import DurationUnitFormat from 'intl-unofficial-duration-unit-format';

export default class extends Helper {
  // =services
  @service clockTick;
  @service intl;

  compute([expiration_time]) {
    if (!expiration_time) return;

    // Parse the expiration time
    const expirationTime = new Date(expiration_time);

    // Get the curent time
    const currentTime = this.clockTick.now;

    // Calculate the difference in milleseconds
    const difference = expirationTime - currentTime;

    // Calculate the difference in seconds if the difference is positive
    const differenceInSeconds =
      difference > 0 ? Math.floor(difference / 1000) : 0;

    // Format the duration
    const duration = new DurationUnitFormat(this.intl.primaryLocale, {
      style: 'timer',
      format: `{hours}:{minutes}:{seconds} ${this.intl.t(
        'resources.session.remaining',
      )}`,
    });

    // Return the formatted duration
    return duration.format(differenceInSeconds);
  }
}
