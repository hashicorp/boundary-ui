import { module, test } from 'qunit';
import { setupTest } from 'admin/tests/helpers';

module(
  'Unit | Controller | scopes/scope/auth-methods/auth-method/index',
  function (hooks) {
    setupTest(hooks);

    test('it exists', function (assert) {
      let controller = this.owner.lookup(
        'controller:scopes/scope/auth-methods/auth-method/index',
      );
      assert.ok(controller);
    });
  },
);
