import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Serializer | account', function(hooks) {
  setupTest(hooks);

  test('it serializes records', function(assert) {
    let store = this.owner.lookup('service:store');
    let record = store.createRecord('account', {});

    let serializedRecord = record.serialize();

    assert.ok(serializedRecord);
  });

  test('it serializes only password when `adapterOptions.serializePassword` is true', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('account');
    const record = store.createRecord('account', {
      type: 'password',
      name: 'Name',
      description: 'Description',
      attributes: {
        login_name: 'Login Name',
        password: 'Password'
      },
      version: 1
    });
    const snapshot = record._createSnapshot();
    snapshot.adapterOptions = {
      serializePassword: true
    };
    const serializedRecord = serializer.serialize(snapshot);
    assert.deepEqual(serializedRecord, {
      password: 'Password',
      version: 1
    });
  });
});
