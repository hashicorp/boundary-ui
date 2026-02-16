/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Serializer | credential store', function (hooks) {
  setupTest(hooks);

  test('it serializes vault-type correctly on create', function (assert) {
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('credential-store');
    const record = store.createRecord('credential-store', {
      type: 'vault',
      name: 'Name',
      description: 'Description',
      address: 'http://localhost:5000',
      ca_cert: 'ca-cert-123',
      client_certificate: 'client-cert-123',
      client_certificate_key: 'client-cert-key-456',
      namespace: 'foobar',
      tls_server_name: 'yes',
      tls_skip_verify: false,
      token: 'foo',
      worker_filter: '"dev" in "/tags/type"',
      version: 1,
    });
    const snapshot = record._createSnapshot();
    const serializedRecord = serializer.serialize(snapshot);
    assert.deepEqual(serializedRecord, {
      type: 'vault',
      name: 'Name',
      description: 'Description',
      version: 1,
      attributes: {
        address: 'http://localhost:5000',
        ca_cert: 'ca-cert-123',
        client_certificate: 'client-cert-123',
        client_certificate_key: 'client-cert-key-456',
        namespace: 'foobar',
        tls_server_name: 'yes',
        tls_skip_verify: false,
        token: 'foo',
        worker_filter: '"dev" in "/tags/type"',
      },
    });
  });

  test('it serializes vault-type correctly on update', function (assert) {
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('credential-store');
    store.push({
      data: {
        id: '1',
        type: 'credential-store',
        attributes: {
          type: 'vault',
          name: 'Name',
          description: 'Description',
          address: 'http://localhost:5000',
          ca_cert: 'ca-cert-123',
          client_certificate: 'client-cert-123',
          client_certificate_key: 'client-cert-key-456',
          namespace: 'foobar',
          tls_server_name: 'yes',
          tls_skip_verify: false,
          token: 'foo',
          worker_filter: null,
          version: 1,
        },
      },
    });
    const record = store.peekRecord('credential-store', '1');
    const snapshot = record._createSnapshot();
    const serializedRecord = serializer.serialize(snapshot);
    assert.deepEqual(serializedRecord, {
      type: 'vault',
      name: 'Name',
      description: 'Description',
      attributes: {
        address: 'http://localhost:5000',
        ca_cert: 'ca-cert-123',
        client_certificate: 'client-cert-123',
        client_certificate_key: 'client-cert-key-456',
        namespace: 'foobar',
        tls_server_name: 'yes',
        tls_skip_verify: false,
        token: 'foo',
        worker_filter: null,
      },
      version: 1,
    });
  });

  test('it serializes empty strings to null for vault-type credential store', function (assert) {
    const store = this.owner.lookup('service:store');
    const record = store.createRecord('credential-store', {
      address: '',
      ca_cert: '',
      client_certificate: '',
      client_certificate_key: '',
      namespace: '',
      tls_server_name: '',
      tls_skip_verify: false,
      type: 'vault',
      worker_filter: '',
    });
    let serializedRecord = record.serialize();
    assert.deepEqual(serializedRecord, {
      attributes: {
        address: null,
        ca_cert: null,
        client_certificate: null,
        client_certificate_key: null,
        namespace: null,
        tls_server_name: null,
        tls_skip_verify: false,
        worker_filter: null,
      },
      description: null,
      name: null,
      type: 'vault',
    });
  });

  test('it does not serialize token if present but falsy for vault-type credential store', function (assert) {
    const store = this.owner.lookup('service:store');
    const record = store.createRecord('credential-store', {
      token: null,
      address: 'http://localhost:5000',
      ca_cert: 'ca-cert-123',
      client_certificate: 'client-cert-123',
      client_certificate_key: 'client-cert-key-456',
      namespace: 'foobar',
      tls_server_name: 'yes',
      tls_skip_verify: false,
      type: 'vault',
      worker_filter: null,
    });
    let serializedRecord = record.serialize();
    assert.deepEqual(
      serializedRecord,
      {
        attributes: {
          address: 'http://localhost:5000',
          ca_cert: 'ca-cert-123',
          client_certificate: 'client-cert-123',
          client_certificate_key: 'client-cert-key-456',
          namespace: 'foobar',
          tls_server_name: 'yes',
          tls_skip_verify: false,
          worker_filter: null,
        },
        description: null,
        name: null,
        type: 'vault',
      },
      'token attribute is not expected',
    );
  });

  test('it does not serialize client certificate key if present but falsy when client certificate is present for vault-type credential store', function (assert) {
    const store = this.owner.lookup('service:store');
    const record = store.createRecord('credential-store', {
      client_certificate: 'client-cert-123',
      client_certificate_key: '',
      address: 'http://localhost:5000',
      token: 'foo',
      ca_cert: 'ca-cert-123',
      namespace: 'foobar',
      tls_server_name: 'yes',
      tls_skip_verify: false,
      worker_filter: null,
      type: 'vault',
    });
    let serializedRecord = record.serialize();
    assert.deepEqual(
      serializedRecord,
      {
        attributes: {
          client_certificate: 'client-cert-123',
          address: 'http://localhost:5000',
          token: 'foo',
          ca_cert: 'ca-cert-123',
          namespace: 'foobar',
          tls_server_name: 'yes',
          tls_skip_verify: false,
          worker_filter: null,
        },
        description: null,
        name: null,
        type: 'vault',
      },
      'client certificate key attribute is not expected',
    );

    record.client_certificate_key = 'client-cert-key-456';
    serializedRecord = record.serialize();
    assert.deepEqual(
      serializedRecord,
      {
        attributes: {
          client_certificate: 'client-cert-123',
          client_certificate_key: 'client-cert-key-456',
          address: 'http://localhost:5000',
          token: 'foo',
          ca_cert: 'ca-cert-123',
          namespace: 'foobar',
          tls_server_name: 'yes',
          tls_skip_verify: false,
          worker_filter: null,
        },
        description: null,
        name: null,
        type: 'vault',
      },
      'client certificate key attribute is expected',
    );
  });

  test('it serializes empty strings to null for static-type credential store', function (assert) {
    const store = this.owner.lookup('service:store');
    const record = store.createRecord('credential-store', {
      name: '',
      description: '',
      type: 'static',
    });
    let serializedRecord = record.serialize();
    assert.deepEqual(serializedRecord, {
      description: null,
      name: null,
      type: 'static',
    });
  });

  test('it serializes static-type correctly on create', function (assert) {
    const store = this.owner.lookup('service:store');
    const record = store.createRecord('credential-store', {
      type: 'static',
      name: 'Static cred store',
      description: 'Description',
    });
    assert.deepEqual(record.serialize(), {
      type: 'static',
      name: 'Static cred store',
      description: 'Description',
    });
  });

  test('it serializes static-type correctly on update', function (assert) {
    const store = this.owner.lookup('service:store');
    store.push({
      data: {
        id: '2',
        type: 'credential-store',
        attributes: {
          type: 'static',
          name: 'Static update',
          description: 'Description',
        },
      },
    });
    const record = store.peekRecord('credential-store', '2');
    const expectedResult = {
      type: 'static',
      name: 'Static update',
      description: 'Description',
    };
    assert.deepEqual(record.serialize(), expectedResult);
  });

  test('it normalizes vault type credential store record', async function (assert) {
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('credential-store');
    const credentialStoreModelClass =
      store.createRecord('credential-store').constructor;
    const payload = {
      id: 'csvlt_123',
      version: 1,
      type: 'vault',
      attributes: {
        token: 'random',
        token_hmac: 'completenonsense',
      },
    };
    const normalized = serializer.normalize(credentialStoreModelClass, payload);
    assert.deepEqual(normalized, {
      data: {
        attributes: {
          type: 'vault',
          version: 1,
          token: '',
          token_hmac: 'completenonsense',
        },
        type: 'credential-store',
        id: 'csvlt_123',
        relationships: {},
      },
    });
  });
});
