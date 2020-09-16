import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module(
  'Unit | Controller | scopes/scope/projects/project/host-catalogs/host-catalog/host-sets/host-set',
  function (hooks) {
    setupTest(hooks);

    // Replace this with your real tests.
    test('it exists', function (assert) {
      let controller = this.owner.lookup(
        'controller:scopes/scope/projects/project/host-catalogs/host-catalog/host-sets/host-set'
      );
      assert.ok(controller);
    });
  }
);
