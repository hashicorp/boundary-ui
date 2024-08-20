import { module, test } from 'qunit';
import { setupTest } from 'desktop/tests/helpers';

module('Unit | Controller | scopes/scope/projects/error', function (hooks) {
  setupTest(hooks);

  // TODO: Replace this with your real tests.
  test('it exists', function (assert) {
    let controller = this.owner.lookup(
      'controller:scopes/scope/projects/error',
    );
    assert.ok(controller);
  });
});
