import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | scopes/scope/groups/group', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let controller = this.owner.lookup('controller:scopes/scope/groups/group');
    assert.ok(controller);
  });
});
