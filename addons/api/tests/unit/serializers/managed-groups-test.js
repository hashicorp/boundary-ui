import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Serializer | Managed groups', function (hooks) {
  setupTest(hooks);

  test('it serializes correctly on create', function (assert) {
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

  test('it serializes correctly on update', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('managed-groups');
    store.push({
      data: {
        id: '1',
        type: 'managed-groups',
        attributes: {
          name: 'Group Test',
          description: 'Description for the test',
          member_ids: ['1', '2'],
          version: 1,
          auth_method_id: '1234',
          type: '80',
        },
      },
    });
    const record = store.peekRecord('managed-groups', '1');
    const snapshot = record._createSnapshot();
    const serializedRecord = serializer.serialize(snapshot);
    assert.deepEqual(serializedRecord, {
      name: 'Group Test',
      description: 'Description for the test',
      version: 1,
      auth_method_id: '1234',
      type: '80',
    });
  });
});
