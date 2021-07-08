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
});
