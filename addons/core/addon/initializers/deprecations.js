/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { registerDeprecationHandler } from '@ember/debug';

const deprecationList = [
  'ember-data:deprecate-early-static',
  'ember-data:deprecate-array-like',
];

export function initialize() {
  registerDeprecationHandler((message, options, next) => {
    // TODO: fix `deprecate-early-static` and `deprecate-array-prototype-extension` warning before ember 5 upgrade
    //silence deprecate-early-static warnings till we find a way to
    //fix ember-cli-mirage discoverEmberDataModels
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
