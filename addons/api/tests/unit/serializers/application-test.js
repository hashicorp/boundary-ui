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
    const scope = store.createRecord('scope', {id: 'global'});
    const record = store.createRecord('user', {
      name: 'User',
      description: 'Description',
      scope
    });
    const serializedRecord = record.serialize();
    assert.deepEqual(serializedRecord, {
      name: 'User',
      description: 'Description'
      //disabled: false,  // TODO:  disabled is temporarily disabled
    });
  });

  test('it normalizes array records from an `items` root key', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('user');
    const userModelClass = store.createRecord('user').constructor;
    const payload = {
      items: [
        { id: 1, name: 'User 1' },
        { id: 2, name: 'User 2' },
        { id: 3, name: 'User 3' },
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
          attributes: { name: 'User 1' },
          relationships: {},
        },
        {
          id: '2',
          type: 'user',
          attributes: { name: 'User 2' },
          relationships: {},
        },
        {
          id: '3',
          type: 'user',
          attributes: { name: 'User 3' },
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
        attributes: { name: 'User 1' },
        relationships: {},
      },
    });
  });
});
