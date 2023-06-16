import { module, test } from 'qunit';
import { setupTest } from 'admin/tests/helpers';

module(
  'Unit | Controller | scopes/scope/targets/target/enable-session-recording/create-storage-bucket',
  function (hooks) {
    setupTest(hooks);

    // TODO: Replace this with your real tests.
    test('it exists', function (assert) {
      let controller = this.owner.lookup(
        'controller:scopes/scope/targets/target/enable-session-recording/create-storage-bucket'
      );
      assert.ok(controller);
    });
  }
);
