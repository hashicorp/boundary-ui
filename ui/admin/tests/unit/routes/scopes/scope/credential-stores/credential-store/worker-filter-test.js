import { module, test } from 'qunit';
import { setupTest } from 'admin/tests/helpers';

module(
  'Unit | Route | scopes/scope/credential-stores/credential-store/worker-filter',
  function (hooks) {
    setupTest(hooks);

    test('it exists', function (assert) {
      let route = this.owner.lookup(
        'route:scopes/scope/credential-stores/credential-store/worker-filter',
      );
      assert.ok(route);
    });
  },
);
