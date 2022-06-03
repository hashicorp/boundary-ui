import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module(
  'Unit | Route | scopes/scope/onboarding/quick-setup/create-resources/success',
  function (hooks) {
    setupTest(hooks);

    test('it exists', function (assert) {
      let route = this.owner.lookup(
        'route:scopes/scope/onboarding/quick-setup/create-resources/success'
      );
      assert.ok(route);
    });
  }
);
