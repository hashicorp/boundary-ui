import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module(
  'Unit | Controller | scopes/scope/targets/target/create-alias',
  function (hooks) {
    setupTest(hooks);

    test('it exists', function (assert) {
      let controller = this.owner.lookup(
        'controller:scopes/scope/targets/target/create-alias',
      );
      assert.ok(controller);
    });
  },
);
