import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | cluster-url', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let controller = this.owner.lookup('controller:cluster-url');
    assert.ok(controller);
    assert.ok(controller.setClusterUrl);
  });
});
