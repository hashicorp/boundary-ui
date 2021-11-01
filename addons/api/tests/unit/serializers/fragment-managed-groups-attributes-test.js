import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module(
  'Unit | Serializer | fragment managed groups attributes',
  function (hooks) {
    setupTest(hooks);

    test('it serializes empty string to null', function (assert) {
      assert.expect(1);
      const store = this.owner.lookup('service:store');
      const record = store.createRecord('fragment-managed-groups-attributes', {
        filter: '',
      });
      const serializedRecord = record.serialize();
      assert.deepEqual(serializedRecord, {
        filter: null,
      });
    });
  }
);
