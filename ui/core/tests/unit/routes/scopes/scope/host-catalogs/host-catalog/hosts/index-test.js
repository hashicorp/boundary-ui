import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | scopes/scope/host-catalogs/host-catalog/hosts/index', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:scopes/scope/host-catalogs/host-catalog/hosts/index');
    assert.ok(route);
  });
});
