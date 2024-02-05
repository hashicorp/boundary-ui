/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Store, { CacheHandler } from '@ember-data/store';
import RequestManager from '@ember-data/request';
import { LegacyNetworkHandler } from '@ember-data/legacy-compat';
import ClientDaemonHandler from 'api/handlers/client-daemon-handler';

export default class extends Store {
  requestManager = new RequestManager();

  constructor(args) {
    super(args);

    const clientDaemonHandler = new ClientDaemonHandler(this);

    this.requestManager.use([clientDaemonHandler, LegacyNetworkHandler]);
    this.requestManager.useCache(CacheHandler);
  }
}
