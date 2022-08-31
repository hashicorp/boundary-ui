import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Transform | principal array', function (hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
    let transform = this.owner.lookup('transform:principal-array');
    assert.ok(transform);
  });
});
