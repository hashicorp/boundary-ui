import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Transform | account attribute map array', function (hooks) {
  setupTest(hooks);

  test('it deserializes an array of account attributes', function (assert) {
    assert.expect(1);
    const transform = this.owner.lookup(
      'transform:account-attribute-map-array'
    );
    const deserialized = transform.deserialize(['preferredName=fullName']);
    assert.deepEqual(deserialized, [{ from: 'preferredName', to: 'fullName' }]);
  });

  test('it serializes an array of account claims', function (assert) {
    assert.expect(1);
    const transform = this.owner.lookup(
      'transform:account-attribute-map-array'
    );
    const serialized = transform.serialize([
      { from: 'preferredName', to: 'fullName' },
    ]);
    assert.deepEqual(serialized, ['preferredName=fullName']);
  });
});
