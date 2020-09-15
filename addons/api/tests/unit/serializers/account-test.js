import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Serializer | account', function(hooks) {
  setupTest(hooks);

  test('it serializes account', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('account');
    const record = store.createRecord('account', {
      type: 'password',
      name: 'Name',
      description: 'Description',
      attributes: {
        login_name: 'Login Name',
        password: 'Password',
      },
      auth_method_id: '1',
      version: 1
    });
    const snapshot = record._createSnapshot();
    snapshot.adapterOptions = {};
    const serializedRecord = serializer.serialize(snapshot);
    assert.deepEqual(serializedRecord, {
      type: 'password',
      name: 'Name',
      description: 'Description',
      attributes: {
        login_name: 'Login Name',
        password: 'Password',
      },
      auth_method_id: '1',
      version: 1
    });
  });

});
