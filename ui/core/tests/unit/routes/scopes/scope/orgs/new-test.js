import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | scopes/scope/orgs/new', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:scopes/scope/orgs/new');
    assert.ok(route);
  });
});
