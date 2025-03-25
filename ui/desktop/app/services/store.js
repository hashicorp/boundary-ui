/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

// This an example of using Store from ember-data/store to get default configuration automatically.
// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import Store from 'ember-data/store';
import { CacheHandler } from '@ember-data/store';
import RequestManager from '@ember-data/request';
import { LegacyNetworkHandler } from '@ember-data/legacy-compat';
import CacheDaemonHandler from 'api/handlers/cache-daemon-handler';

export default class extends Store {
  requestManager = new RequestManager();

  constructor(args) {
    super(args);

    const cacheDaemonHandler = new CacheDaemonHandler(this);

    this.requestManager.use([cacheDaemonHandler, LegacyNetworkHandler]);
    this.requestManager.useCache(CacheHandler);
  }
}
