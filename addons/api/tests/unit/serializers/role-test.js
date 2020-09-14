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
      grants: [{value: 'foo'}, {value: 'bar'}],
      version: 1
    });
    const snapshot = record._createSnapshot();
    snapshot.adapterOptions = {};
    const serializedRecord = serializer.serialize(snapshot);
    assert.deepEqual(serializedRecord, {
      name: 'User',
      description: 'Description',
      version: 1
    });
  });

  test('it serializes only grants when `adapterOptions.serializeGrants` is true', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('role');
    const record = store.createRecord('role', {
      name: 'User',
      description: 'Description',
      grants: [{value: 'foo'}, {value: 'bar'}],
      version: 1
    });
    const snapshot = record._createSnapshot();
    snapshot.adapterOptions = {
      serializeGrants: true
    };
    const serializedRecord = serializer.serialize(snapshot);
    assert.deepEqual(serializedRecord, {
      grant_strings: ['foo', 'bar'],
      version: 1
    });
  });

  test('it normalizes records with array fields', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('role');
    const roleModelClass = store.createRecord('role').constructor;
    const payload = {
      id: '1',
      name: 'Role 1',
      grant_strings: ['*', '*']
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
          grants: [{value: '*'}, {value: '*'}],
          principals: []
        },
        relationships: {},
      },
    });
  });

  test('it normalizes missing principals to empty array', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('role');
    const role = store.createRecord('role').constructor;
    const payload = {
      id: '1',
      name: 'Role 1',
      scope: { id: 'o_123' }
    };
    const normalized = serializer.normalizeSingleResponse(
      store,
      role,
      payload
    );
    assert.deepEqual(normalized, {
      included: [],
      data: {
        id: '1',
        type: 'role',
        attributes: {
          name: 'Role 1',
          scope: { scope_id: 'o_123' },
          principals: []
        },
        relationships: {},
      },
    });
  });

});
