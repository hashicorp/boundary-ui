import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module(
  'Unit | Serializer | fragment credential store attributes',
  function (hooks) {
    setupTest(hooks);

    test('it serializes empty strings to null', function (assert) {
      assert.expect(1);
      const store = this.owner.lookup('service:store');
      const record = store.createRecord(
        'fragment-credential-store-attributes',
        {
          address: '',
          ca_cert: '',
          client_certificate: '',
          client_certificate_key: '',
          namespace: '',
          tls_server_name: '',
          tls_skip_verify: false,
        }
      );
      let serializedRecord = record.serialize();
      assert.deepEqual(serializedRecord, {
        address: null,
        ca_cert: null,
        client_certificate: null,
        client_certificate_key: null,
        namespace: null,
        tls_server_name: null,
        tls_skip_verify: false,
      });
    });

    test('it does not serialize token if present but falsy', function (assert) {
      assert.expect(1);
      const store = this.owner.lookup('service:store');
      const record = store.createRecord(
        'fragment-credential-store-attributes',
        {
          token: null,
          address: 'http://localhost:5000',
          ca_cert: 'ca-cert-123',
          client_certificate: 'client-cert-123',
          client_certificate_key: 'client-cert-key-456',
          namespace: 'foobar',
          tls_server_name: 'yes',
          tls_skip_verify: false,
        }
      );
      let serializedRecord = record.serialize();
      assert.deepEqual(
        serializedRecord,
        {
          address: 'http://localhost:5000',
          ca_cert: 'ca-cert-123',
          client_certificate: 'client-cert-123',
          client_certificate_key: 'client-cert-key-456',
          namespace: 'foobar',
          tls_server_name: 'yes',
          tls_skip_verify: false,
        },
        'token attribute is not expected'
      );
    });

    test('it does not serialize client certificate key if present but falsy when client certificate is present', function (assert) {
      assert.expect(2);
      const store = this.owner.lookup('service:store');
      const record = store.createRecord(
        'fragment-credential-store-attributes',
        {
          client_certificate: 'client-cert-123',
          client_certificate_key: '',
          address: 'http://localhost:5000',
          token: 'foo',
          ca_cert: 'ca-cert-123',
          namespace: 'foobar',
          tls_server_name: 'yes',
          tls_skip_verify: false,
        }
      );
      let serializedRecord = record.serialize();
      assert.deepEqual(
        serializedRecord,
        {
          client_certificate: 'client-cert-123',
          address: 'http://localhost:5000',
          token: 'foo',
          ca_cert: 'ca-cert-123',
          namespace: 'foobar',
          tls_server_name: 'yes',
          tls_skip_verify: false,
        },
        'client certificate key attribute is not expected'
      );

      record.client_certificate_key = 'client-cert-key-456';
      serializedRecord = record.serialize();
      assert.deepEqual(
        serializedRecord,
        {
          client_certificate: 'client-cert-123',
          client_certificate_key: 'client-cert-key-456',
          address: 'http://localhost:5000',
          token: 'foo',
          ca_cert: 'ca-cert-123',
          namespace: 'foobar',
          tls_server_name: 'yes',
          tls_skip_verify: false,
        },
        'client certificate key attribute is expected'
      );
    });
  }
);
