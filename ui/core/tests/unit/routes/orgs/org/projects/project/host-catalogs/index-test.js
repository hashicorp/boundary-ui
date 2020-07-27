import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module(
  'Unit | Route | orgs/org/projects/project/host-catalogs/index',
  function (hooks) {
    setupTest(hooks);

    test('it exists', function (assert) {
      let route = this.owner.lookup(
        'route:orgs/org/projects/project/host-catalogs/index'
      );
      assert.ok(route);
    });
  }
);
