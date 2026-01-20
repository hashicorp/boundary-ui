/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import CanHelper from 'ember-can/helpers/can';
import { service } from '@ember/service';
import config from 'admin/config/environment';

const isDevelopment = config.environment === 'development';

/**
 * Normally, abilities that access tracked values are not recomputed on change.
 * This helper overrides the Ember Can helper to trigger recompute whenever
 * a feature flag changes.  This functionality is available only in the
 * development environment, since feature flags may be toggled in the UI, and
 * also for performance reasons as this effectively recomputes _all_ `can`
 * helpers on any feature flag change.
 */
class DevelopmentCanHelper extends CanHelper {
  // =services

  @service features;

  // =methods

  constructor() {
    super(...arguments);
    this.observeAllFlags();
  }

  willDestroy() {
    this.removeAllFlags();
    super.willDestroy();
  }

  observeAllFlags() {
    this.features.flags.forEach((flag) =>
      /* eslint-disable-next-line ember/no-observers */
      this.features.addObserver(flag, this, 'recompute'),
    );
  }

  removeAllFlags() {
    this.features.flags.forEach((flag) =>
      /* eslint-disable-next-line ember/no-observers */
      this.features.removeObserver(flag, this, 'recompute'),
    );
  }
}

// In development, export the development helper, otherwise the original.
export default isDevelopment ? DevelopmentCanHelper : CanHelper;
