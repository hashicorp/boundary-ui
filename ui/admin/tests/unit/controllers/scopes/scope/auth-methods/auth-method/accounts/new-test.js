import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module(
  'Unit | Controller | scopes/scope/auth-methods/auth-method/accounts/new',
  function (hooks) {
    setupTest(hooks);

    test('it exists', function (assert) {
      let controller = this.owner.lookup(
        'controller:scopes/scope/auth-methods/auth-method/accounts/new'
      );
      assert.ok(controller);
    });
  }
);
