import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | quicksetup', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let route = this.owner.lookup('route:quicksetup');
    assert.ok(route);
  });
});
