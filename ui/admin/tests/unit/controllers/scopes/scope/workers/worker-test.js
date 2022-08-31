import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | scopes/scope/users/user', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let controller = this.owner.lookup(
      'controller:scopes/scope/workers/worker'
    );
    assert.ok(controller);
  });
});
