import { module, test } from 'qunit';
import { setupTest } from 'admin/tests/helpers';

module(
  'Unit | Controller | scopes/scope/credential-stores/credential-store/credential-libraries/credential-library/index',
  function (hooks) {
    setupTest(hooks);

    test('it exists', function (assert) {
      let controller = this.owner.lookup(
        'controller:scopes/scope/credential-stores/credential-store/credential-libraries/credential-library/index',
      );
      assert.ok(controller);
    });
  },
);
