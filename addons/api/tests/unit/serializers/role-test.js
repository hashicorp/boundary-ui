import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Serializer | role', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('role');
    assert.ok(serializer);
  });

  test('it serializes records and excludes their array fields', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const record = store.createRecord('role', {
      name: 'Role',
      description: 'Description',
      user_ids: ['u_123', 'u_456'],
      group_ids: ['g_123', 'g_456'],
      grants: ['*', '*'],
    });
    const serializedRecord = record.serialize();
    assert.deepEqual(serializedRecord, {
      name: 'Role',
      description: 'Description',
    });
  });

  test('it normalizes records with with array fields', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('role');
    const roleModelClass = store.createRecord('role').constructor;
    const payload = {
      id: '1',
      name: 'Role 1',
      user_ids: ['u_123', 'u_456'],
      group_ids: ['g_123', 'g_456'],
      grants: ['*', '*'],
    };
    const normalized = serializer.normalizeSingleResponse(
      store,
      roleModelClass,
      payload
    );
    assert.deepEqual(normalized, {
      included: [],
      data: {
        id: '1',
        type: 'role',
        attributes: {
          name: 'Role 1',
          user_ids: ['u_123', 'u_456'],
          group_ids: ['g_123', 'g_456'],
          grants: ['*', '*'],
        },
        relationships: {},
      },
    });
  });
});
