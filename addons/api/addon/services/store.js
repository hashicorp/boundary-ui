/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Store, { CacheHandler } from '@ember-data/store';
import RequestManager from '@ember-data/request';
import { LegacyNetworkHandler } from '@ember-data/legacy-compat';

export default class extends Store {
  requestManager = new RequestManager();

  constructor(args) {
    super(args);

    this.requestManager.use([LegacyNetworkHandler]);
    this.requestManager.useCache(CacheHandler);
  }
}
