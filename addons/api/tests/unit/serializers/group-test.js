import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Serializer | group', function(hooks) {
  setupTest(hooks);

  test('it serializes groups normally, without members', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('group');
    const record = store.createRecord('group', {
      name: 'Group',
      description: 'Description',
      member_ids: [ '1', '2', ],
      version: 1
    });
    const snapshot = record._createSnapshot();
    snapshot.adapterOptions = {};
    const serializedRecord = serializer.serialize(snapshot);
    assert.deepEqual(serializedRecord, {
      name: 'Group',
      description: 'Description',
      version: 1
    });
  });

  test('it serializes only host sets and version when an `adapterOptions.memberIDs` array is passed', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('group');
    const record = store.createRecord('group', {
      name: 'Group',
      description: 'Description',
      member_ids: [ '1', '2', ],
      version: 1
    });
    const snapshot = record._createSnapshot();
    snapshot.adapterOptions = {
      memberIDs: ['4', '5']
    };
    const serializedRecord = serializer.serialize(snapshot);
    assert.deepEqual(serializedRecord, {
      member_ids: ['4', '5'],
      version: 1
    });
  });

});
