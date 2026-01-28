/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Serializer | credential', function (hooks) {
  setupTest(hooks);

  test('it serializes username_password type correctly on create', function (assert) {
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

  test('it serializes json_object type correctly on create', async function (assert) {
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('credential');
    const record = store.createRecord('credential', {
      credential_store_id: 'csst_i7p1eu0Nw8',
      json_object:
        '{"secret_key": "QWERTYUIOP", "secret_access_key": "QWERT.YUIOP234567890"}',
      type: 'json',
      name: 'Name',
      description: 'Description',
      version: 1,
    });
    const snapshot = record._createSnapshot();
    const serializedRecord = serializer.serialize(snapshot);

    assert.deepEqual(serializedRecord, {
      attributes: {
        object: {
          secret_key: 'QWERTYUIOP',
          secret_access_key: 'QWERT.YUIOP234567890',
        },
      },
      credential_store_id: 'csst_i7p1eu0Nw8',
      type: 'json',
      name: 'Name',
      description: 'Description',
      version: 1,
    });
  });

  test('it serializes ssh_private_key type correctly when only the username is updated', function (assert) {
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('credential');
    const record = store.createRecord('credential', {
      private_key_passphrase: null,
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

  test('it serializes username_password type correctly by removing "json_object" attribute', function (assert) {
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('credential');
    const record = store.createRecord('credential', {
      password: '',
      username: 'user',
      json_object: '{"secret_key": "QWERTYUIOP"}',
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

  test('it serializes ssh_private_key type correctly by removing "json_object" attribute', function (assert) {
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('credential');
    const record = store.createRecord('credential', {
      private_key_passphrase: 'passphrasesaresosecure',
      private_key: 'superPriveKey',
      json_object: '{"secret_key": "QWERTYUIOP"}',
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

  test('it normalizes "username_password" type credential record', async function (assert) {
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
          json_object: '',
        },
        type: 'credential',
        id: 'credup_123',
        relationships: {},
      },
    });
  });

  test('it normalizes "ssh_private_key" type credential record', async function (assert) {
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
          json_object: '',
        },
        type: 'credential',
        id: 'credspk_123',
        relationships: {},
      },
    });
  });

  test('it normalizes "json" type credential record', async function (assert) {
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('credential');
    const credentialModelClass = store.createRecord('credential').constructor;
    const payload = {
      id: 'credjson_123',
      version: 1,
      type: 'json',
    };
    const normalized = serializer.normalize(credentialModelClass, payload);

    assert.deepEqual(normalized, {
      data: {
        attributes: {
          type: 'json',
          version: 1,
          private_key_passphrase: '',
          private_key: '',
          password: '',
          json_object: '',
        },
        type: 'credential',
        id: 'credjson_123',
        relationships: {},
      },
    });
  });
});
