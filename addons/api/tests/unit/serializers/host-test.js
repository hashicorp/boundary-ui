import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Serializer | host', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let store = this.owner.lookup('service:store');
    let serializer = store.serializerFor('host');

    assert.ok(serializer);
  });

  test('it serializes records', function (assert) {
    let store = this.owner.lookup('service:store');
    let record = store.createRecord('host', {});

    let serializedRecord = record.serialize();

    assert.ok(serializedRecord);
  });
});
