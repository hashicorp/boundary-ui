/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

// Importing 'Store' from 'ember-data/store' to get default configuration automatically.
// TODO: Remove eslint-disable after upgrading to eslint-plugin-ember >= v12.2.1
// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import Store from 'ember-data/store';
import { CacheHandler } from '@ember-data/store';
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
