/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Serializer | user', function (hooks) {
  setupTest(hooks);

  test('it serializes users normally, without accounts', function (assert) {
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('user');
    const record = store.createRecord('user', {
      name: 'user',
      description: 'Description',
      account_ids: ['1', '2'],
      version: 1,
    });
    const snapshot = record._createSnapshot();
    snapshot.adapterOptions = {};
    const serializedRecord = serializer.serialize(snapshot);
    assert.deepEqual(serializedRecord, {
      name: 'user',
      description: 'Description',
      version: 1,
    });
  });

  test('it serializes only host sets and version when an `adapterOptions.accountIDs` array is passed', function (assert) {
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('user');
    const record = store.createRecord('user', {
      name: 'user',
      description: 'Description',
      account_ids: ['1', '2'],
      version: 1,
    });
    const snapshot = record._createSnapshot();
    snapshot.adapterOptions = {
      accountIDs: ['4', '5'],
    };
    const serializedRecord = serializer.serialize(snapshot);
    assert.deepEqual(serializedRecord, {
      account_ids: ['4', '5'],
      version: 1,
    });
  });

  test('it normalizes missing account_ids to empty array', function (assert) {
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('user');
    const user = store.createRecord('user').constructor;
    const payload = {
      id: '1',
      name: 'user 1',
      scope: { id: 'o_123' },
    };
    const normalized = serializer.normalizeSingleResponse(store, user, payload);
    assert.deepEqual(normalized, {
      included: [],
      data: {
        id: '1',
        type: 'user',
        attributes: {
          authorized_actions: [],
          name: 'user 1',
          scope: { id: 'o_123', scope_id: 'o_123' },
          account_ids: [],
        },
        relationships: {},
      },
    });
  });
});
