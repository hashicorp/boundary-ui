import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Transform | account claim map array', function (hooks) {
  setupTest(hooks);

  test('it deserializes an array of account claims', function (assert) {
    assert.expect(1);
    const transform = this.owner.lookup('transform:account-claim-map-array');
    const deserialized = transform.deserialize(['oid=sub', 'full_name=name']);
    assert.deepEqual(deserialized, [
      { from: 'oid', to: 'sub' },
      { from: 'full_name', to: 'name' },
    ]);
  });

  test('it serializes an array of account claims', function (assert) {
    assert.expect(1);
    const transform = this.owner.lookup('transform:account-claim-map-array');
    const serialized = transform.serialize([
      { from: 'oid', to: 'sub' },
      { from: 'full_name', to: 'name' },
    ]);
    assert.deepEqual(serialized, ['oid=sub', 'full_name=name']);
  });
});
