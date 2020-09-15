import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Serializer | account', function(hooks) {
  setupTest(hooks);

  test('it serializes normally', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('account');
    const record = store.createRecord('account', {
      type: 'password',
      name: 'Name',
      auth_method_id: '1',
      description: 'Description',
      attributes: {
        login_name: 'Login Name',
      },
      version: 1
    });
    const snapshot = record._createSnapshot();
    snapshot.adapterOptions = {};
    const serializedRecord = serializer.serialize(snapshot);
    assert.deepEqual(serializedRecord, {
      type: 'password',
      name: 'Name',
      auth_method_id: '1',
      description: 'Description',
      attributes: {
        login_name: 'Login Name'
      },
      version: 1
    });
  });

  test('it serializes password attribute when `adapterOptions.password` is true', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('account');
    const record = store.createRecord('account', {
      type: 'password',
      name: 'Name',
      auth_method_id: '1',
      description: 'Description',
      attributes: {
        login_name: 'Login Name',
      },
      version: 1
    });
    const snapshot = record._createSnapshot();
    snapshot.adapterOptions = {
      password: 'Password'
    };
    const serializedRecord = serializer.serialize(snapshot);
    assert.deepEqual(serializedRecord, {
      type: 'password',
      name: 'Name',
      auth_method_id: '1',
      description: 'Description',
      attributes: {
        login_name: 'Login Name',
        password: 'Password'
      },
      version: 1
    });
  });

  test('it does not serialize password for non-new records', function (assert) {
    assert.expect(0);
  });

  test('it serializes only password when `adapterOptions.method` is set to `set-password`', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('account');
    const record = store.createRecord('account', {
      type: 'password',
      name: 'Name',
      description: 'Description',
      attributes: {
        login_name: 'Login Name'
      },
      auth_method_id: '1',
      version: 1
    });
    const snapshot = record._createSnapshot();
    snapshot.adapterOptions = {
      method: 'set-password',
      password: 'Password'
    };
    const serializedRecord = serializer.serialize(snapshot);
    assert.deepEqual(serializedRecord, {
      password: 'Password',
      version: 1
    });
  });
});
