import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | orgs/authenticate', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:orgs/authenticate');
    assert.ok(route);
  });
});
