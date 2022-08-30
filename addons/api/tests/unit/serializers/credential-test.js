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

  test('it serializes username_password type correctly when only the username is updated', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('credential');
    const record = store.createRecord('credential', {
      password: '',
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
      private_key_passphrase: 'passphrasesaresosecure',
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
        private_key_passphrase: 'passphrasesaresosecure',
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

  test('it serializes ssh_private_key type correctly when only the username is updated', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('credential');
    const record = store.createRecord('credential', {
      private_key_passphrase: '',
      private_key: '',
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
        username: 'user',
      },
      credential_store_id: 'csst_i7p1eu0Nw8',
      type: 'ssh_private_key',
      name: 'Name',
      description: 'Description',
      version: 1,
    });
  });

  test('it normalizes "username_password" type credential record', async function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('credential');
    const credentialModelClass = store.createRecord('credential').constructor;
    const payload = {
      id: 'credup_123',
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
          type: 'username_password',
          username: 'username',
          version: 1,
          private_key_passphrase: '',
          private_key: '',
          password: '',
        },
        type: 'credential',
        id: 'credup_123',
        relationships: {},
      },
    });
  });

  test('it normalizes "ssh_private_key" type credential record', async function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('credential');
    const credentialModelClass = store.createRecord('credential').constructor;
    const payload = {
      id: 'credspk_123',
      version: 1,
      type: 'ssh_private_key',
      attributes: {
        username: 'username',
        private_key_passphrase: 'random',
        private_key_hmac: 'completenonsense',
      },
    };
    const normalized = serializer.normalize(credentialModelClass, payload);

    assert.deepEqual(normalized, {
      data: {
        attributes: {
          type: 'ssh_private_key',
          username: 'username',
          version: 1,
          private_key_passphrase: '',
          private_key: '',
          password: '',
        },
        type: 'credential',
        id: 'credspk_123',
        relationships: {},
      },
    });
  });
});
