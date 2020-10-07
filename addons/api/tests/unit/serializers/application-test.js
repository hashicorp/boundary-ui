import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Serializer | application', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('application');
    assert.ok(serializer);
  });

  test('it serializes records', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const record = store.createRecord('user', {
      name: 'User',
      description: 'Description',
      scope: {
        scope_id: 'global',
        type: 'global',
      },
    });
    const serializedRecord = record.serialize();
    assert.deepEqual(serializedRecord, {
      name: 'User',
      description: 'Description',
      scope_id: 'global',
    });
  });

  test('it serializes scope_id', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const record = store.createRecord('user', {
      name: 'User',
      description: 'Description',
      scope: {
        scope_id: 'global',
        type: 'global',
      },
    });
    const serializedRecord = record.serialize();
    assert.deepEqual(serializedRecord, {
      name: 'User',
      description: 'Description',
      scope_id: 'global',
    });
  });

  test('it does not serialize scope_id when serializeScopeID is false', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('user');
    const record = store.createRecord('user', {
      name: 'User',
      description: 'Description',
      scope: {
        scope_id: 'global',
        type: 'global',
      },
    });
    const snapshot = record._createSnapshot();
    serializer.serializeScopeID = false;
    const serializedRecord = serializer.serialize(snapshot);
    assert.deepEqual(serializedRecord, {
      name: 'User',
      description: 'Description'
    });
  });

  test('it serializes empty strings to null', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const record = store.createRecord('user', {
      name: '',
      description: '',
      version: null,
    });
    let serializedRecord = record.serialize();
    assert.deepEqual(serializedRecord, {
      name: null,
      description: null,
    });
  });

  test('it serializes non-nullish version fields', function (assert) {
    assert.expect(2);
    const store = this.owner.lookup('service:store');
    const record = store.createRecord('user', {
      name: 'User',
      description: 'Description',
      version: null,
    });
    let serializedRecord = record.serialize();
    assert.deepEqual(serializedRecord, {
      name: 'User',
      description: 'Description',
    });
    record.version = 1;
    serializedRecord = record.serialize();
    assert.deepEqual(serializedRecord, {
      name: 'User',
      description: 'Description',
      version: 1,
    });
  });

  test('it normalizes array records from an `items` root key', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('user');
    const userModelClass = store.createRecord('user').constructor;
    const payload = {
      items: [
        { id: 1, name: 'User 1', scope: { id: 'o_123' } },
        { id: 2, name: 'User 2', scope: { id: 'o_123' } },
        { id: 3, name: 'User 3', scope: { id: 'o_123' } },
      ],
    };
    const normalizedArray = serializer.normalizeArrayResponse(
      store,
      userModelClass,
      payload
    );
    assert.deepEqual(normalizedArray, {
      included: [],
      data: [
        {
          id: '1',
          type: 'user',
          attributes: { name: 'User 1', scope: { scope_id: 'o_123' } },
          relationships: {},
        },
        {
          id: '2',
          type: 'user',
          attributes: { name: 'User 2', scope: { scope_id: 'o_123' } },
          relationships: {},
        },
        {
          id: '3',
          type: 'user',
          attributes: { name: 'User 3', scope: { scope_id: 'o_123' } },
          relationships: {},
        },
      ],
    });
  });

  test('it normalizes single, unrooted records', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('user');
    const userModelClass = store.createRecord('user').constructor;
    const payload = {
      id: '1',
      name: 'User 1',
      scope: { id: 'o_123' },
    };
    const normalized = serializer.normalizeSingleResponse(
      store,
      userModelClass,
      payload
    );
    assert.deepEqual(normalized, {
      included: [],
      data: {
        id: '1',
        type: 'user',
        attributes: {
          name: 'User 1',
          account_ids: [],
          scope: { scope_id: 'o_123' }
        },
        relationships: {},
      },
    });
  });

  test('it normalizes missing arrays in single responses if annotated in model attributes', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('target');
    const target = store.createRecord('target').constructor;
    const payload = {
      id: '1',
      name: 'Target 1',
      scope: { id: 'o_123' },
    };
    const normalized = serializer.normalizeSingleResponse(
      store,
      target,
      payload
    );
    assert.deepEqual(normalized, {
      included: [],
      data: {
        id: '1',
        type: 'target',
        attributes: {
          name: 'Target 1',
          scope: { scope_id: 'o_123' },
          host_sets: [],
        },
        relationships: {},
      },
    });
  });
});
