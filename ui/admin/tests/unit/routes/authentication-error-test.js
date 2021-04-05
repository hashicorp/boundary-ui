import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | authentication-error', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let route = this.owner.lookup('route:authentication-error');
    assert.ok(route);
  });
});
