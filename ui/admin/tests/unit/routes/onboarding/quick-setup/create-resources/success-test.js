import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module(
  'Unit | Route | onboarding/quick-setup/create-resources/success',
  function (hooks) {
    setupTest(hooks);

    test('it exists', function (assert) {
      let route = this.owner.lookup(
        'route:onboarding/quick-setup/create-resources/success'
      );
      assert.ok(route);
    });
  }
);
