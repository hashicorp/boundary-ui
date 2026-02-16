/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import {
  TYPE_AUTH_METHOD_PASSWORD,
  TYPE_AUTH_METHOD_OIDC,
  TYPE_AUTH_METHOD_LDAP,
} from 'api/models/auth-method';

module('Unit | Serializer | account', function (hooks) {
  setupTest(hooks);

  test('it serializes OIDC-type with only issuer and subject in `attributes` on create', function (assert) {
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('account');
    const record = store.createRecord('account', {
      type: TYPE_AUTH_METHOD_OIDC,
      name: 'Name',
      auth_method_id: '1',
      description: 'Description',
      issuer: 'issuer',
      subject: 'sub',
      full_name: 'full_name',
      email: 'email',
      version: 1,
    });
    const snapshot = record._createSnapshot();
    const serializedRecord = serializer.serialize(snapshot);
    assert.deepEqual(serializedRecord, {
      type: TYPE_AUTH_METHOD_OIDC,
      name: 'Name',
      auth_method_id: '1',
      description: 'Description',
      version: 1,
      attributes: {
        issuer: 'issuer',
        subject: 'sub',
      },
    });
  });

  test('it serializes OIDC-type without `attributes` on update', function (assert) {
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('account');
    store.push({
      data: {
        id: '1',
        type: 'account',
        attributes: {
          type: TYPE_AUTH_METHOD_OIDC,
          name: 'Name',
          auth_method_id: '1',
          description: 'Description',
          issuer: 'issuer',
          subject: 'sub',
          full_name: 'full_name',
          email: 'email',
          version: 1,
        },
      },
    });
    const record = store.peekRecord('account', '1');
    const snapshot = record._createSnapshot();
    const serializedRecord = serializer.serialize(snapshot);
    assert.notOk(serializedRecord.attributes);
    assert.deepEqual(serializedRecord, {
      name: 'Name',
      description: 'Description',
      version: 1,
    });
  });

  test('it serializes password-type normally', function (assert) {
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('account');
    const record = store.createRecord('account', {
      type: TYPE_AUTH_METHOD_PASSWORD,
      name: 'Name',
      auth_method_id: '1',
      description: 'Description',
      login_name: 'Login Name',
      version: 1,
    });
    const snapshot = record._createSnapshot();
    const serializedRecord = serializer.serialize(snapshot);
    assert.deepEqual(serializedRecord, {
      type: TYPE_AUTH_METHOD_PASSWORD,
      name: 'Name',
      auth_method_id: '1',
      description: 'Description',
      attributes: {
        login_name: 'Login Name',
      },
      version: 1,
    });
  });

  test('it serializes password attribute when `adapterOptions.password` is true', function (assert) {
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('account');
    const record = store.createRecord('account', {
      type: TYPE_AUTH_METHOD_PASSWORD,
      name: 'Name',
      auth_method_id: '1',
      description: 'Description',
      login_name: 'Login Name',
      version: 1,
    });
    const snapshot = record._createSnapshot();
    snapshot.adapterOptions = {
      password: 'Password',
    };
    const serializedRecord = serializer.serialize(snapshot);
    assert.deepEqual(serializedRecord, {
      type: TYPE_AUTH_METHOD_PASSWORD,
      name: 'Name',
      auth_method_id: '1',
      description: 'Description',
      attributes: {
        login_name: 'Login Name',
        password: 'Password',
      },
      version: 1,
    });
  });

  test('it serializes only password when `adapterOptions.method` is set to `set-password`', function (assert) {
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('account');
    const record = store.createRecord('account', {
      type: TYPE_AUTH_METHOD_PASSWORD,
      name: 'Name',
      description: 'Description',
      login_name: 'Login Name',
      auth_method_id: '1',
      version: 1,
    });
    const snapshot = record._createSnapshot();
    snapshot.adapterOptions = {
      method: 'set-password',
      password: 'Password',
    };
    const serializedRecord = serializer.serialize(snapshot);
    assert.deepEqual(serializedRecord, {
      password: 'Password',
      version: 1,
    });
  });

  test('it serializes a custom payload when `adapterOptions.method` is set to `change-password`', function (assert) {
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('account');
    const record = store.createRecord('account', {
      type: TYPE_AUTH_METHOD_PASSWORD,
      name: 'Name',
      description: 'Description',
      login_name: 'Login Name',
      auth_method_id: '1',
      version: 1,
    });
    const snapshot = record._createSnapshot();
    snapshot.adapterOptions = {
      method: 'change-password',
      currentPassword: 'Current',
      newPassword: 'New',
    };
    const serializedRecord = serializer.serialize(snapshot);
    assert.deepEqual(serializedRecord, {
      current_password: 'Current',
      new_password: 'New',
      version: 1,
    });
  });

  test('it serializes LDAP-type with only login_name in `attributes` on create', function (assert) {
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('account');
    const record = store.createRecord('account', {
      type: TYPE_AUTH_METHOD_LDAP,
      name: 'Name',
      auth_method_id: '1',
      description: 'Description',
      login_name: 'Login Name',
      full_name: 'Full Nname',
      email: 'Email',
      dn: 'dn',
      member_of_groups: ['Group'],
      version: 1,
    });
    const snapshot = record._createSnapshot();
    const serializedRecord = serializer.serialize(snapshot);
    assert.deepEqual(serializedRecord, {
      type: TYPE_AUTH_METHOD_LDAP,
      name: 'Name',
      auth_method_id: '1',
      description: 'Description',
      version: 1,
      attributes: {
        login_name: 'Login Name',
      },
    });
  });

  test('it serializes LDAP-type without `attributes`', function (assert) {
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('account');
    store.push({
      data: {
        id: '1',
        type: 'account',
        attributes: {
          type: TYPE_AUTH_METHOD_LDAP,
          name: 'Name',
          auth_method_id: '1',
          description: 'Description',
          login_name: 'Login Name',
          full_name: 'Full Nname',
          email: 'Email',
          dn: 'dn',
          member_of_groups: ['Group'],
          version: 1,
        },
      },
    });
    const record = store.peekRecord('account', '1');
    const snapshot = record._createSnapshot();
    const serializedRecord = serializer.serialize(snapshot);
    assert.deepEqual(serializedRecord, {
      name: 'Name',

      description: 'Description',
      version: 1,
    });
  });
});
