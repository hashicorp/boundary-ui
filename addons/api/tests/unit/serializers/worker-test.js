/**
 * Copyright IBM Corp. 2021, 2025
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

  test('it normalizes missing `api_tags`, `config_tags`, and `canonical_tags`', function (assert) {
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('worker');
    const worker = store.createRecord('worker').constructor;
    const payload = {
      id: 'w_123',
      name: 'hardest worker',
      scope: { id: 'global' },
      version: 1,
      address: 'localhost',
    };

    const normalized = serializer.normalizeSingleResponse(
      store,
      worker,
      payload,
    );

    assert.deepEqual(normalized, {
      data: {
        attributes: {
          address: 'localhost',
          api_tags: {},
          authorized_actions: [],
          canonical_tags: {},
          config_tags: {},
          name: 'hardest worker',
          scope: {
            id: 'global',
            scope_id: 'global',
          },
          version: 1,
        },
        id: 'w_123',
        relationships: {},
        type: 'worker',
      },
      included: [],
    });
  });
});
