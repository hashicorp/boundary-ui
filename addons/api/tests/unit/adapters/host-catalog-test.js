import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Adapter | host catalog', function (hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
    let adapter = this.owner.lookup('adapter:host-catalog');
    assert.ok(adapter);
  });
});
