import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module(
  'Unit | Serializer | fragment credential store attributes',
  function (hooks) {
    setupTest(hooks);

    // Replace this with your real tests.
    test('it exists', function (assert) {
      let store = this.owner.lookup('service:store');
      let serializer = store.serializerFor(
        'fragment-credential-store-attributes'
      );

      assert.ok(serializer);
    });

    test('it serializes records', function (assert) {
      let store = this.owner.lookup('service:store');
      let record = store.createRecord(
        'fragment-credential-store-attributes',
        {}
      );

      let serializedRecord = record.serialize();

      assert.ok(serializedRecord);
    });
  }
);
