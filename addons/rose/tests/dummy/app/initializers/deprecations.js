/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
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
