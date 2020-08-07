import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Serializer | role', function(hooks) {
  setupTest(hooks);

  test('it serializes roles normally, without grants', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('role');
    const record = store.createRecord('role', {
      name: 'User',
      description: 'Description',
      grants: ['foo', 'bar']
    });
    const snapshot = record._createSnapshot();
    snapshot.adapterOptions = {};
    const serializedRecord = serializer.serialize(snapshot);
    assert.deepEqual(serializedRecord, {
      name: 'User',
      description: 'Description'
    });
  });

  test('it serializes only grants when `adapterOptions.serializeGrants` is true', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('role');
    const record = store.createRecord('role', {
      name: 'User',
      description: 'Description',
      grants: ['foo', 'bar']
    });
    const snapshot = record._createSnapshot();
    snapshot.adapterOptions = {
      serializeGrants: true
    };
    const serializedRecord = serializer.serialize(snapshot);
    assert.deepEqual(serializedRecord, {
      grants: ['foo', 'bar']
    });
  });

});
