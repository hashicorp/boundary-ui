import { module, test } from 'qunit';
import { setupTest } from 'admin/tests/helpers';

module(
  'Unit | Route | scopes/scope/workers/worker/create-tags',
  function (hooks) {
    setupTest(hooks);

    test('it exists', function (assert) {
      let route = this.owner.lookup(
        'route:scopes/scope/workers/worker/create-tags',
      );
      assert.ok(route);
    });
  },
);
