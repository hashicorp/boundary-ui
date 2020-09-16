import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module(
  'Unit | Route | scopes/scope/auth-methods/auth-method/accounts/new',
  function (hooks) {
    setupTest(hooks);

    test('it exists', function (assert) {
      let route = this.owner.lookup(
        'route:scopes/scope/auth-methods/auth-method/accounts/new'
      );
      assert.ok(route);
    });
  }
);
