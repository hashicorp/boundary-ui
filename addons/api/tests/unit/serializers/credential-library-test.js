/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import {
  TYPE_CREDENTIAL_LIBRARY_VAULT_GENERIC,
  TYPE_CREDENTIAL_LIBRARY_VAULT_SSH_CERTIFICATE,
} from 'api/models/credential-library';

module('Unit | Serializer | credential library', function (hooks) {
  setupTest(hooks);

  test('it serializes correctly on create', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('credential-library');
    const record = store.createRecord('credential-library', {
      type: TYPE_CREDENTIAL_LIBRARY_VAULT_GENERIC,
      name: 'Name',
      description: 'Description',
      path: '/vault/path',
      http_method: 'GET',
      version: 1,
    });
    const snapshot = record._createSnapshot();
    const serializedRecord = serializer.serialize(snapshot);
    assert.deepEqual(serializedRecord, {
      type: TYPE_CREDENTIAL_LIBRARY_VAULT_GENERIC,
      credential_store_id: null,
      name: 'Name',
      description: 'Description',
      version: 1,
      attributes: {
        path: '/vault/path',
        http_method: 'GET',
        http_request_body: null,
      },
    });
  });

  test('it serializes correctly on update', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('credential-library');
    store.push({
      data: {
        id: '1',
        type: 'credential-library',
        attributes: {
          type: TYPE_CREDENTIAL_LIBRARY_VAULT_GENERIC,
          name: 'Name',
          description: 'Description',
          path: '/vault/path',
          http_method: 'GET',
          version: 1,
        },
      },
    });
    const record = store.peekRecord('credential-library', '1');
    const snapshot = record._createSnapshot();
    const serializedRecord = serializer.serialize(snapshot);
    assert.deepEqual(serializedRecord, {
      type: TYPE_CREDENTIAL_LIBRARY_VAULT_GENERIC,
      credential_store_id: null,
      name: 'Name',
      description: 'Description',
      attributes: {
        path: '/vault/path',
        http_method: 'GET',
        http_request_body: null,
      },
      version: 1,
    });
  });

  test('it serializes empty strings to null', function (assert) {
    assert.expect(2);
    const store = this.owner.lookup('service:store');
    const vaultGenericRecord = store.createRecord('credential-library', {
      type: TYPE_CREDENTIAL_LIBRARY_VAULT_GENERIC,
      http_method: '',
      path: null,
    });
    const vaultSSHCertificateRecord = store.createRecord('credential-library', {
      type: TYPE_CREDENTIAL_LIBRARY_VAULT_SSH_CERTIFICATE,
      http_method: '',
      path: null,
    });
    let serializedVaultGenericRecord = vaultGenericRecord.serialize();
    let serializedVaultSSHCertificateRecord =
      vaultSSHCertificateRecord.serialize();
    assert.deepEqual(serializedVaultGenericRecord, {
      attributes: {
        path: null,
        http_method: null,
        http_request_body: null,
      },
      credential_store_id: null,
      description: null,
      name: null,
      type: TYPE_CREDENTIAL_LIBRARY_VAULT_GENERIC,
    });
    assert.deepEqual(serializedVaultSSHCertificateRecord, {
      attributes: {
        critical_options: null,
        extensions: null,
        key_bits: null,
        key_id: null,
        key_type: null,
        path: null,
        ttl: null,
        username: null,
      },
      credential_store_id: null,
      description: null,
      name: null,
      type: TYPE_CREDENTIAL_LIBRARY_VAULT_SSH_CERTIFICATE,
    });
  });

  test('it does not serialize http_request_body unless http_method is set to POST', function (assert) {
    assert.expect(2);
    const store = this.owner.lookup('service:store');
    const record = store.createRecord('credential-library', {
      type: TYPE_CREDENTIAL_LIBRARY_VAULT_GENERIC,
      http_method: 'GET',
      http_request_body: 'body',
    });
    let serializedRecord = record.serialize();
    assert.deepEqual(
      serializedRecord,
      {
        attributes: {
          http_method: 'GET',
          http_request_body: null,
          path: null,
        },
        credential_store_id: null,
        description: null,
        name: null,
        type: TYPE_CREDENTIAL_LIBRARY_VAULT_GENERIC,
      },
      'http_request_body attribute is not expected'
    );

    record.http_method = 'POST';
    serializedRecord = record.serialize();
    assert.deepEqual(
      serializedRecord,
      {
        attributes: {
          http_method: 'POST',
          http_request_body: 'body',
          path: null,
        },
        credential_store_id: null,
        description: null,
        name: null,
        type: TYPE_CREDENTIAL_LIBRARY_VAULT_GENERIC,
      },
      'http_request_body attribute is expected'
    );
  });

  test('it serializes vault_ssh_certificate correctly', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('credential-library');
    store.push({
      data: {
        id: '1',
        type: 'credential-library',
        attributes: {
          type: TYPE_CREDENTIAL_LIBRARY_VAULT_SSH_CERTIFICATE,
          version: 1,
          name: 'Name',
          description: 'Description',
          path: '/vault/path',
          username: 'user',
          key_type: 'rsa',
          key_bits: 100,
          ttl: '100',
          key_id: 'id',
          extensions: [{ key: 'key', value: 'value' }],
          critical_options: [{ key: 'key', value: 'value' }],
        },
      },
    });
    const record = store.peekRecord('credential-library', '1');
    const snapshot = record._createSnapshot();
    const serializedRecord = serializer.serialize(snapshot);
    assert.deepEqual(serializedRecord, {
      type: TYPE_CREDENTIAL_LIBRARY_VAULT_SSH_CERTIFICATE,
      credential_store_id: null,
      name: 'Name',
      description: 'Description',
      attributes: {
        path: '/vault/path',
        username: 'user',
        key_type: 'rsa',
        key_bits: 100,
        ttl: '100',
        key_id: 'id',
        extensions: { key: 'value' },
        critical_options: { key: 'value' },
      },
      version: 1,
    });
  });
});
