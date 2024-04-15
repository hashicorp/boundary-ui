/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Store, { CacheHandler } from '@ember-data/store';
import RequestManager from '@ember-data/request';
import { LegacyNetworkHandler } from '@ember-data/legacy-compat';
import IndexedDbHandler from 'api/handlers/indexed-db-handler';

export default class extends Store {
  requestManager = new RequestManager();

  constructor(args) {
    super(args);

    const indexedDbHandler = new IndexedDbHandler(this);

    this.requestManager.use([indexedDbHandler, LegacyNetworkHandler]);
    this.requestManager.useCache(CacheHandler);
  }
}
