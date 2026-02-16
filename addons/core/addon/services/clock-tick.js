/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { getOwner } from '@ember/application';
import { task, timeout } from 'ember-concurrency';

export default class ClockTickService extends Service {
  // =attributes

  /**
   * The current datetime.  This is updated once every `interval` while the
   * service is running (1s by default).
   * @type {number}
   */
  @tracked now = Date.now();

  /**
   * The frequency to update `now`, in milliseconds.
   * @type {number}
   */
  frequency = 1000;

  /**
   * Updates the value of `now` every `frequency` milliseconds.
   */
  _tick = task(async () => {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      await timeout(this.frequency);
      this.now = Date.now();
    }
  });

  /**
   * This service is enabled only in non-test environments.
   * @type {boolean}
   */
  get enabled() {
    const config = getOwner(this).resolveRegistration('config:environment');
    return config.environment !== 'test';
  }

  // =methods

  /**
   * Starts the timer, if enabled.
   */
  constructor() {
    super(...arguments);
    if (this.enabled) this._tick.perform();
  }

  /**
   * Stops the timer.
   */
  willDestroy() {
    super.willDestroy(...arguments);
    this._tick.cancelAll();
  }
}
