import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | orgs/org/roles/role', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let controller = this.owner.lookup('controller:orgs/org/roles/role');
    assert.ok(controller);
  });
});
