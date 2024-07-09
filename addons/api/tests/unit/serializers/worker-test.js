/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Serializer | worker', function (hooks) {
  setupTest(hooks);

  test('it serializes normally', function (assert) {
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('worker');
    const record = store.createRecord('worker', {
      name: 'worker',
      description: 'Description',
      version: 1,
    });
    const snapshot = record._createSnapshot();
    snapshot.adapterOptions = {};
    const serializedRecord = serializer.serialize(snapshot);
    assert.deepEqual(serializedRecord, {
      version: 1,
      description: 'Description',
      name: 'worker',
    });
  });

  test('it serializes using `adapterOptions.workerGeneratedAuthToken`', function (assert) {
    const scopeId = 'global';
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('worker');
    const record = store.createRecord('worker', {
      name: 'worker',
      description: 'Description',
      version: 1,
      scope: {
        scope_id: scopeId,
        type: 'global',
      },
    });
    const snapshot = record._createSnapshot();
    snapshot.adapterOptions = {
      workerGeneratedAuthToken: '123-abc',
    };
    const serializedRecord = serializer.serialize(snapshot);
    assert.deepEqual(serializedRecord, {
      scope_id: scopeId,
      worker_generated_auth_token: '123-abc',
    });
  });

  test('it serializes using `adapterOptions.apiTags`', function (assert) {
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('worker');
    const record = store.createRecord('worker', {
      name: 'worker',
      api_tags: null,
      version: 1,
    });
    const snapshot = record._createSnapshot();
    snapshot.adapterOptions = {
      apiTags: {
        key: ['value'],
      },
    };
    const serializedRecord = serializer.serialize(snapshot);
    assert.deepEqual(serializedRecord, {
      version: 1,
      api_tags: { key: ['value'] },
    });
  });
});
