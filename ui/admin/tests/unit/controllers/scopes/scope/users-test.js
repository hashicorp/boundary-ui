import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | scopes/scope/users', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let controller = this.owner.lookup('controller:scopes/scope/users');
    assert.ok(controller);
  });
});
