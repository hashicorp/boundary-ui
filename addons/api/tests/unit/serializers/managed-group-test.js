/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import {
  TYPE_AUTH_METHOD_OIDC,
  TYPE_AUTH_METHOD_LDAP,
} from 'api/models/auth-method';

module('Unit | Serializer | Managed group', function (hooks) {
  setupTest(hooks);

  test('it serializes correctly on create with no filter provided', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('managed-group');
    const record = store.createRecord('managed-group', {
      name: 'Group',
      description: 'Description',
      member_ids: ['1', '2'],
      version: 1,
      auth_method_id: '1234',
    });
    const snapshot = record._createSnapshot();
    snapshot.adapterOptions = {};
    const serializedRecord = serializer.serialize(snapshot);
    assert.deepEqual(serializedRecord, {
      name: 'Group',
      description: 'Description',
      version: 1,
      auth_method_id: '1234',
      type: null,
      attributes: {},
    });
  });

  test('it serializes correctly on create when filter provided', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('managed-group');
    const record = store.createRecord('managed-group', {
      name: 'Group',
      description: 'Description',
      member_ids: ['1', '2'],
      version: 1,
      auth_method_id: '1234',
      type: TYPE_AUTH_METHOD_OIDC,
      filter_string: 'key=value',
    });
    const snapshot = record._createSnapshot();
    snapshot.adapterOptions = {};
    const serializedRecord = serializer.serialize(snapshot);
    assert.deepEqual(serializedRecord, {
      name: 'Group',
      description: 'Description',
      version: 1,
      auth_method_id: '1234',
      type: TYPE_AUTH_METHOD_OIDC,
      attributes: {
        filter: 'key=value',
      },
    });
  });

  test('it serializes correctly on create when group names are provided', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('managed-group');
    const record = store.createRecord('managed-group', {
      name: 'Group',
      description: 'Description',
      member_ids: ['1', '2'],
      version: 1,
      auth_method_id: '1234',
      type: TYPE_AUTH_METHOD_LDAP,
      group_names: [{ value: 'scientists' }],
    });
    const snapshot = record._createSnapshot();
    snapshot.adapterOptions = {};
    const serializedRecord = serializer.serialize(snapshot);
    assert.deepEqual(serializedRecord, {
      name: 'Group',
      description: 'Description',
      version: 1,
      auth_method_id: '1234',
      type: TYPE_AUTH_METHOD_LDAP,
      attributes: {
        group_names: ['scientists'],
      },
    });
  });

  test('it does not serialize version when it has null or undefined value', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('managed-group');
    store.push({
      data: {
        id: '1',
        type: 'managed-group',
        attributes: {
          name: 'Group Test',
          description: 'Description for the test',
          member_ids: ['1', '2'],
          version: undefined,
          auth_method_id: '1234',
          type: TYPE_AUTH_METHOD_OIDC,
          filter_string: 'key=value',
        },
      },
    });
    const record = store.peekRecord('managed-group', '1');
    const snapshot = record._createSnapshot();
    const serializedRecord = serializer.serialize(snapshot);
    assert.deepEqual(serializedRecord, {
      name: 'Group Test',
      description: 'Description for the test',
      auth_method_id: '1234',
      type: TYPE_AUTH_METHOD_OIDC,
      attributes: {
        filter: 'key=value',
      },
    });
  });

  test('it does not serialize readOnly attributes', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('managed-group');
    const record = store.createRecord('managed-group', {
      name: 'Group',
      description: 'Description',
      version: 1,
      auth_method_id: '1234',
      member_ids: ['1', '2'],
      created_time: Date.now(),
      updated_time: Date.now(),
    });
    const snapshot = record._createSnapshot();
    snapshot.adapterOptions = {};
    const serializedRecord = serializer.serialize(snapshot);
    assert.deepEqual(serializedRecord, {
      name: 'Group',
      description: 'Description',
      version: 1,
      auth_method_id: '1234',
      type: null,
      attributes: {},
    });
  });

  test('it serializes correctly on update', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('managed-group');
    store.push({
      data: {
        id: '1',
        type: 'managed-group',
        attributes: {
          name: 'Group Test',
          description: 'Description for the test',
          member_ids: ['1', '2'],
          version: 1,
          auth_method_id: '1234',
          type: TYPE_AUTH_METHOD_OIDC,
          filter_string: 'key=value',
        },
      },
    });
    const record = store.peekRecord('managed-group', '1');
    const snapshot = record._createSnapshot();
    const serializedRecord = serializer.serialize(snapshot);
    assert.deepEqual(serializedRecord, {
      name: 'Group Test',
      description: 'Description for the test',
      version: 1,
      auth_method_id: '1234',
      type: TYPE_AUTH_METHOD_OIDC,
      attributes: {
        filter: 'key=value',
      },
    });
  });

  test('it normalizes correctly', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('managed-group');
    const hostSetModelClass = store.createRecord('managed-group').constructor;
    const payload = {
      id: '1',
      description: 'Description for the test',
      version: 1,
      auth_method_id: '1234',
      type: TYPE_AUTH_METHOD_OIDC,
      attributes: {
        filter: 'key=value',
      },
    };
    const normalized = serializer.normalizeSingleResponse(
      store,
      hostSetModelClass,
      payload
    );

    assert.deepEqual(normalized, {
      included: [],
      data: {
        id: '1',

        attributes: {
          type: TYPE_AUTH_METHOD_OIDC,
          version: 1,
          authorized_actions: [],
          member_ids: [],
          description: 'Description for the test',
          auth_method_id: '1234',
          filter_string: 'key=value',
        },
        type: 'managed-group',
        relationships: {},
      },
    });
  });
});
