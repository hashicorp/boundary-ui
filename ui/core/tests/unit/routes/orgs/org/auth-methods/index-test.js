import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | orgs/org/auth-methods/index', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:orgs/org/auth-methods/index');
    assert.ok(route);
  });
});
