import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Serializer | credential store', function (hooks) {
  setupTest(hooks);

  test('it serializes vault-type correctly on create', function (assert) {
    assert.expect(1);
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
      },
    });
  });

  test('it serializes vault-type correctly on update', function (assert) {
    assert.expect(1);
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
      },
      version: 1,
    });
  });

  test('it serializes empty strings to null', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const record = store.createRecord('credential-store', {
      address: '',
      ca_cert: '',
      client_certificate: '',
      client_certificate_key: '',
      namespace: '',
      tls_server_name: '',
      tls_skip_verify: false,
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
      },
      description: null,
      name: null,
      type: null,
    });
  });

  test('it does not serialize token if present but falsy', function (assert) {
    assert.expect(1);
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
        },
        description: null,
        name: null,
        type: null,
      },
      'token attribute is not expected'
    );
  });

  test('it does not serialize client certificate key if present but falsy when client certificate is present', function (assert) {
    assert.expect(2);
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
        },
        description: null,
        name: null,
        type: null,
      },
      'client certificate key attribute is not expected'
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
        },
        description: null,
        name: null,
        type: null,
      },
      'client certificate key attribute is expected'
    );
  });
});
