import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | orgs/org/groups/group', function(hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function(assert) {
    let controller = this.owner.lookup('controller:orgs/org/groups/group');
    assert.ok(controller);
  });
});
