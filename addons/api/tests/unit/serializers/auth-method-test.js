import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Serializer | auth method', function (hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
    let store = this.owner.lookup('service:store');
    let serializer = store.serializerFor('auth-method');

    assert.ok(serializer);
  });

  test('it serializes records', function (assert) {
    let store = this.owner.lookup('service:store');
    let record = store.createRecord('auth-method', {});

    let serializedRecord = record.serialize();

    assert.ok(serializedRecord);
  });

  test('it sorts primary first in normalizeArrayResponse', function (assert) {
    assert.expect(2);
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('auth-method');
    const modelClass = store.createRecord('auth-method').constructor;
    const payload = {
      items: [{ id: 1 }, { id: 2, primary: true }, { id: 3 }],
    };
    const normalizedArray = serializer.normalizeArrayResponse(
      store,
      modelClass,
      payload
    );
    assert.ok(payload.items[1].primary, 'Second payload item is primary');
    assert.deepEqual(
      normalizedArray,
      {
        included: [],
        data: [
          {
            id: '2',
            type: 'auth-method',
            attributes: { primary: true },
            relationships: {},
          },
          {
            id: '1',
            type: 'auth-method',
            attributes: {},
            relationships: {},
          },
          {
            id: '3',
            type: 'auth-method',
            attributes: {},
            relationships: {},
          },
        ],
      },
      'First normalized itme is primary'
    );
  });
});
