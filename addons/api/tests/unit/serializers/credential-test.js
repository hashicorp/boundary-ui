import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Serializer | credential', function (hooks) {
  setupTest(hooks);

  test('it serializes username_password type correctly on create', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('credential');
    const record = store.createRecord('credential', {
      password: 'pass',
      username: 'user',
      credential_store_id: 'csst_i7p1eu0Nw8',
      type: 'username_password',
      name: 'Name',
      description: 'Description',
      version: 1,
    });
    const snapshot = record._createSnapshot();
    const serializedRecord = serializer.serialize(snapshot);

    assert.deepEqual(serializedRecord, {
      attributes: {
        password: 'pass',
        username: 'user',
      },
      credential_store_id: 'csst_i7p1eu0Nw8',
      type: 'username_password',
      name: 'Name',
      description: 'Description',
      version: 1,
    });
  });

  test('it serializes ssh_private_key type correctly on create', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('credential');
    const record = store.createRecord('credential', {
      passphrase: 'passphrasesaresosecure',
      private_key: 'superPriveKey',
      username: 'user',
      credential_store_id: 'csst_i7p1eu0Nw8',
      type: 'ssh_private_key',
      name: 'Name',
      description: 'Description',
      version: 1,
    });
    const snapshot = record._createSnapshot();
    const serializedRecord = serializer.serialize(snapshot);

    assert.deepEqual(serializedRecord, {
      attributes: {
        passphrase: 'passphrasesaresosecure',
        private_key: 'superPriveKey',
        username: 'user',
      },
      credential_store_id: 'csst_i7p1eu0Nw8',
      type: 'ssh_private_key',
      name: 'Name',
      description: 'Description',
      version: 1,
    });
  });

  test('it normalizes credential record', async function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('credential');
    const credentialModelClass = store.createRecord('credential').constructor;
    const payload = {
      id: 'cred_123',
      version: 1,
      type: 'username_password',
      attributes: {
        username: 'username',
        password_hmac: 'completenonsense',
      },
    };
    const normalized = serializer.normalize(credentialModelClass, payload);

    assert.deepEqual(normalized, {
      data: {
        attributes: {
          password: '',
          type: 'username_password',
          username: 'username',
          version: 1,
        },
        type: 'credential',
        id: 'cred_123',
        relationships: {},
      },
    });
  });
});
