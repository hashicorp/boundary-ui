/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { registerDeprecationHandler } from '@ember/debug';

export function initialize(application) {
  const config = application.resolveRegistration('config:environment');
  const isTesting = config.environment === 'test';
  if (isTesting) {
    // Disable all deprecations for now in tests.
    registerDeprecationHandler((/*message, options, next*/) => {
      return;
    });
  }
}

export default {
  initialize,
};
