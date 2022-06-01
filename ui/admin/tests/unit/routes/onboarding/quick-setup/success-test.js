import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | onboarding/quick-setup/success', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let route = this.owner.lookup('route:onboarding/quick-setup/success');
    assert.ok(route);
  });
});
