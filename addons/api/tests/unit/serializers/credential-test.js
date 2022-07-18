import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Serializer | credential', function (hooks) {
  setupTest(hooks);

  test('it serializes correctly on create', function(assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('credential');
    const record = store.createRecord('credential', {
      password: "pass",
      username: "user",
      credential_store_id: "cs_i7p1eu0Nw8",
      type: "username_password",
      name: "Name",
      description: "Description",
      version: 1, 
    });
    const snapshot = record._createSnapshot();
    const serializedRecord = serializer.serialize(snapshot);
    console.log(serializedRecord);
    assert.deepEqual(serializedRecord, {
      attributes: {
        password_hmac: "pass",
        username: "user",
      },
      credential_store_id: "cs_i7p1eu0Nw8",
      type: "username_password",
      name: "Name",
      description: "Description",
      version: 1,
    });
  })
})