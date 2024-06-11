import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module(
  'Unit | Controller | scopes/scope/targets/target/brokered-credential-sources',
  function (hooks) {
    setupTest(hooks);

    test('it exists', function (assert) {
      let controller = this.owner.lookup(
        'controller:scopes/scope/targets/target/brokered-credential-sources',
      );
      assert.ok(controller);
    });
  },
);
