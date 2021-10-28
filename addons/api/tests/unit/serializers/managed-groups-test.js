import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Serializer | Managed groups', function (hooks) {
  setupTest(hooks);

  test('it serializes managed groups normally, without members', function (assert) {
    assert.expect(1);
    // TODO: move store declaration at module level. Before doing so, to make sure it works, generate one out, one in and deep compare.
    // TODO: if moving store out works, move serializer too.
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('managed-groups');
    const record = store.createRecord('managed-groups', {
      name: 'Group',
      description: 'Description',
      member_ids: ['1', '2'],
      version: 1,
      auth_method_id: '1234',
      type: '80',
    });
    const snapshot = record._createSnapshot();
    snapshot.adapterOptions = {};
    const serializedRecord = serializer.serialize(snapshot);
    assert.deepEqual(serializedRecord, {
      name: 'Group',
      description: 'Description',
      version: 1,
      auth_method_id: '1234',
      type: '80',
    });
  });

  test('it seralizes only members associated with this group and version when a `memberIDs` array is provided', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('managed-groups');
    const record = store.createRecord('managed-groups', {
      name: 'Group',
      description: 'Description',
      member_ids: ['1', '2'],
      version: 1,
      auth_method_id: '1234',
      type: '80',
    });
    const snapshot = record._createSnapshot();
    snapshot.adapterOptions = {
      memberIDs: ['4', '5'],
    };
    const serializedRecord = serializer.serialize(snapshot);
    console.log(JSON.stringify(serializedRecord));
    assert.deepEqual(serializedRecord, {
      member_ids: ['4', '5'],
      version: 1,
    });
  });
});
