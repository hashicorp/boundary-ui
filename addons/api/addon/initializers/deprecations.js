/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { registerDeprecationHandler } from '@ember/debug';

const deprecationList = ['ember-data:deprecate-early-static'];

export function initialize() {
  registerDeprecationHandler((message, options, next) => {
    // TODO: Remove deprecation handling for `deprecate-early-static` warning
    // once we upgrade to ember-cli-mirage v3.0.0 which fixes this issue.
    // More info about this issue here: https://github.com/miragejs/ember-cli-mirage/issues/2441
    if (options?.id && deprecationList.includes(options.id)) {
      return;
    }
    if (options?.url) {
      message += options.url;
    }
    next(message, options);
  });
}

export default {
  initialize,
};
