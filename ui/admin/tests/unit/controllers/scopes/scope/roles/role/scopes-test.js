import { module, test } from 'qunit';
import { setupTest } from 'admin/tests/helpers';

module('Unit | Controller | scopes/scope/roles/role/scopes', function (hooks) {
  setupTest(hooks);

  // TODO: Replace this with your real tests.
  test('it exists', function (assert) {
    let controller = this.owner.lookup(
      'controller:scopes/scope/roles/role/scopes',
    );
    assert.ok(controller);
  });
});
