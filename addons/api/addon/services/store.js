/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

// Additional configuration is needed when importing from @ember-data/store.
// To get default configuration automatically we can import Store from ember-data/store.
// However, that violates an eslint rule. Thoughts?
import Store from '@ember-data/store';
import { CacheHandler } from '@ember-data/store';
import Cache from '@ember-data/json-api';
import RequestManager from '@ember-data/request';
import {
  adapterFor,
  LegacyNetworkHandler,
  normalize,
  pushPayload,
  serializeRecord,
  serializerFor,
} from '@ember-data/legacy-compat';
import IndexedDbHandler from 'api/handlers/indexed-db-handler';
import {
  buildSchema,
  instantiateRecord,
  modelFor,
  teardownRecord,
} from '@ember-data/model/hooks';

export default class extends Store {
  requestManager = new RequestManager();
  adapterFor = adapterFor;
  serializerFor = serializerFor;
  pushPayload = pushPayload;
  normalize = normalize;
  serializeRecord = serializeRecord;

  constructor(args) {
    super(args);

    const indexedDbHandler = new IndexedDbHandler(this);

    this.requestManager.use([indexedDbHandler, LegacyNetworkHandler]);
    this.requestManager.useCache(CacheHandler);
  }

  createCache(storeWrapper) {
    return new Cache(storeWrapper);
  }

  createSchemaService() {
    return buildSchema(this);
  }

  instantiateRecord(identifier, createRecordArgs) {
    return instantiateRecord.call(this, identifier, createRecordArgs);
  }

  teardownRecord(record) {
    teardownRecord.call(this, record);
  }

  modelFor(type) {
    return modelFor.call(this, type) || super.modelFor(type);
  }
}
