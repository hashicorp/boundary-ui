import { module, test } from 'qunit';
import { setupTest } from 'admin/tests/helpers';

module('Unit | Controller | help', function (hooks) {
  setupTest(hooks);

  // TODO: Replace this with your real tests.
  test('it exists', function (assert) {
    let controller = this.owner.lookup('controller:help');
    assert.ok(controller);
  });
});
