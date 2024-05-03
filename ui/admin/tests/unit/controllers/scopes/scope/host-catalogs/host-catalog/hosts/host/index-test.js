import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module(
  'Unit | Controller | scopes/scope/host-catalogs/host-catalog/hosts/host/index',
  function (hooks) {
    setupTest(hooks);

    test('it exists', function (assert) {
      let controller = this.owner.lookup(
        'controller:scopes/scope/host-catalogs/host-catalog/hosts/host/index',
      );
      assert.ok(controller);
    });
  },
);
