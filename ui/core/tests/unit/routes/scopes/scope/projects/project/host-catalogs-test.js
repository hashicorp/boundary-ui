import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | scopes/scope/projects/project/host-catalogs', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:scopes/scope/projects/project/host-catalogs');
    assert.ok(route);
  });
});
