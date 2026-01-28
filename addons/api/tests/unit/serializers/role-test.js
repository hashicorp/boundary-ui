/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Serializer | role', function (hooks) {
  setupTest(hooks);

  test('it serializes roles normally, without grants', function (assert) {
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('role');
    const record = store.createRecord('role', {
      name: 'User',
      description: 'Description',
      grant_strings: ['foo', 'bar'],
      version: 1,
    });
    const snapshot = record._createSnapshot();
    snapshot.adapterOptions = {};
    const serializedRecord = serializer.serialize(snapshot);
    assert.deepEqual(serializedRecord, {
      name: 'User',
      description: 'Description',
      version: 1,
      grant_scope_ids: [],
    });
  });

  test('it serializes only grant strings when `adapterOptions.grantStrings` is set', function (assert) {
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('role');
    const record = store.createRecord('role', {
      name: 'User',
      description: 'Description',
      grant_strings: ['grant1', 'grant2'],
      version: 1,
    });
    const snapshot = record._createSnapshot();
    snapshot.adapterOptions = {
      grantStrings: ['foo', 'bar'],
    };
    const serializedRecord = serializer.serialize(snapshot);
    assert.deepEqual(serializedRecord, {
      grant_strings: ['foo', 'bar'],
      version: 1,
    });
  });

  test('it serializes only principals when `adapterOptions.principalIDs` is set', function (assert) {
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('role');
    const record = store.createRecord('role', {
      name: 'User',
      description: 'Description',
      principal_ids: [],
      version: 1,
    });
    const snapshot = record._createSnapshot();
    snapshot.adapterOptions = {
      principalIDs: ['u_123'],
    };
    const serializedRecord = serializer.serialize(snapshot);
    assert.deepEqual(serializedRecord, {
      principal_ids: ['u_123'],
      version: 1,
    });
  });

  test('it serializes only grant scope IDs when `adapterOptions.grantScopeIDs` is set', function (assert) {
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('role');
    const record = store.createRecord('role', {
      name: 'User',
      description: 'Description',
      grant_scope_ids: ['this'],
      version: 1,
    });
    const snapshot = record._createSnapshot();
    snapshot.adapterOptions = {
      grantScopeIDs: ['this', 'children'],
    };
    const serializedRecord = serializer.serialize(snapshot);
    assert.deepEqual(serializedRecord, {
      grant_scope_ids: ['this', 'children'],
      version: 1,
    });
  });

  test('it normalizes records with array fields', function (assert) {
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('role');
    const roleModelClass = store.createRecord('role').constructor;
    const payload = {
      id: '1',
      name: 'Role 1',
      grant_strings: ['*', '*'],
      grant_scope_ids: ['*', '*'],
      principals: ['*'],
    };
    const normalized = serializer.normalizeSingleResponse(
      store,
      roleModelClass,
      payload,
    );
    assert.deepEqual(normalized, {
      included: [],
      data: {
        id: '1',
        type: 'role',
        attributes: {
          authorized_actions: [],
          name: 'Role 1',
          grant_strings: ['*', '*'],
          grant_scope_ids: ['*', '*'],
          principals: ['*'],
        },
        relationships: {},
      },
    });
  });

  test('it normalizes missing arrays to empty array', function (assert) {
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('role');
    const role = store.createRecord('role').constructor;
    const payload = {
      id: '1',
      name: 'Role 1',
      scope: { id: 'o_123' },
    };
    const normalized = serializer.normalizeSingleResponse(store, role, payload);
    assert.deepEqual(normalized, {
      included: [],
      data: {
        id: '1',
        type: 'role',
        attributes: {
          authorized_actions: [],
          name: 'Role 1',
          scope: { id: 'o_123', scope_id: 'o_123' },
          principals: [],
          grant_strings: [],
          grant_scope_ids: [],
        },
        relationships: {},
      },
    });
  });
});
