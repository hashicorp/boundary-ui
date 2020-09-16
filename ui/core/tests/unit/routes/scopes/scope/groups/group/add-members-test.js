import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | scopes/scope/groups/group/add-members', function (
  hooks
) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let route = this.owner.lookup(
      'route:scopes/scope/groups/group/add-members'
    );
    assert.ok(route);
  });
});
