import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Serializer | fragment string', function (hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
    let store = this.owner.lookup('service:store');
    let serializer = store.serializerFor('fragment-string');

    assert.ok(serializer);
  });

  test('it serializes records', function (assert) {
    let store = this.owner.lookup('service:store');
    let record = store.createRecord('fragment-string', {
      value: 'string value',
    });

    let serializedRecord = record.serialize();

    assert.equal(serializedRecord, 'string value');
  });

  test('it normalizes records', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('fragment-string');
    const modelClass = store.createRecord('fragment-string').constructor;
    const payload = 'string value';
    const normalized = serializer.normalizeSingleResponse(
      store,
      modelClass,
      payload
    );
    assert.deepEqual(normalized, {
      included: [],
      data: {
        id: null,
        type: 'fragment-string',
        attributes: {
          value: 'string value',
        },
        relationships: {},
      },
    });
  });
});
