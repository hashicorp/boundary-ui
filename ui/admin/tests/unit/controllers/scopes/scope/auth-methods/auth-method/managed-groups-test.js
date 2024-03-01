import { module, test } from 'qunit';
import { setupTest } from 'admin/tests/helpers';

module(
  'Unit | Controller | scopes/scope/auth-methods/auth-method/managed-groups',
  function (hooks) {
    setupTest(hooks);

    test('it exists', function (assert) {
      let controller = this.owner.lookup(
        'controller:scopes/scope/auth-methods/auth-method/managed-groups',
      );
      assert.ok(controller);
    });
  },
);
