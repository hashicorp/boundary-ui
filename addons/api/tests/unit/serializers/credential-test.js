import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Serializer | credential', function (hooks) {
  setupTest(hooks);

  test('it serializes correctly on create', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('credential');
    const record = store.createRecord('credential', {
      password: 'pass',
      username: 'user',
      credential_store_id: 'cs_i7p1eu0Nw8',
      type: 'username_password',
      name: 'Name',
      description: 'Description',
    });
    const snapshot = record._createSnapshot();
    const serializedRecord = serializer.serialize(snapshot);

    assert.deepEqual(serializedRecord, {
      attributes: {
        password: 'pass',
        username: 'user',
      },
      credential_store_id: 'cs_i7p1eu0Nw8',
      type: 'username_password',
      name: 'Name',
      description: 'Description',
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
        password: '12345678',
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
        id: 'cred_123',
        relationships: {},
        type: 'credential',
      },
    });
  });
});
