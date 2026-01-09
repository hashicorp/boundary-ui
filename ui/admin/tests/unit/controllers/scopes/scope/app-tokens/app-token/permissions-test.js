import { module, test } from 'qunit';
import { setupTest } from 'admin/tests/helpers';

module(
  'Unit | Controller | scopes/scope/app-tokens/app-token/permissions',
  function (hooks) {
    setupTest(hooks);

    test('it exists', function (assert) {
      let controller = this.owner.lookup(
        'controller:scopes/scope/app-tokens/app-token/permissions',
      );
      assert.ok(controller);
    });

    test('showNoActiveScopesWarning works as expected', function (assert) {
      let controller = this.owner.lookup(
        'controller:scopes/scope/app-tokens/app-token/permissions',
      );

      controller.set('model', {
        permissions: [{ grant_scopes: [] }, { grant_scopes: ['scope-1'] }],
      });

      assert.ok(
        controller.showNoActiveScopesWarning,
        'Expected warning when there is a permission with no active scopes',
      );

      controller.set('model', {
        permissions: [
          { grant_scopes: ['scope-1'] },
          { grant_scopes: ['scope-2'] },
        ],
      });

      assert.notOk(
        controller.showNoActiveScopesWarning,
        'No warning expected when all permissions have active scopes',
      );
    });
  },
);
