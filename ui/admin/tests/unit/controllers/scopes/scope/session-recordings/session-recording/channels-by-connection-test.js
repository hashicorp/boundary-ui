import { module, test } from 'qunit';
import { setupTest } from 'admin/tests/helpers';

module(
  'Unit | Controller | session-recordings | session-recording | channels-by-connection',
  function (hooks) {
    setupTest(hooks);

    test('it exists', function (assert) {
      let controller = this.owner.lookup(
        'controller:scopes/scope/session-recordings/session-recording/channels-by-connection'
      );
      assert.ok(controller);
    });
  }
);
