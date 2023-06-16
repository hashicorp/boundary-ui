import { module, test } from 'qunit';
import { setupTest } from 'admin/tests/helpers';

module(
  'Unit | Route | scopes/scope/targets/target/enable-session-recording/create-storage-bucket',
  function (hooks) {
    setupTest(hooks);

    test('it exists', function (assert) {
      let route = this.owner.lookup(
        'route:scopes/scope/targets/target/enable-session-recording/create-storage-bucket'
      );
      assert.ok(route);
    });
  }
);
