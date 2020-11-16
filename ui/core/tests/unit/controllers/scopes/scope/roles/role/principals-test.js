import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | scopes/scope/roles/role/principals', function (
  hooks
) {
  setupTest(hooks);

  // TODO: Replace this with your real tests.
  test('it exists', function (assert) {
    let controller = this.owner.lookup(
      'controller:scopes/scope/roles/role/principals'
    );
    assert.ok(controller);
  });
});
