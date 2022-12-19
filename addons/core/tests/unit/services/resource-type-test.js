import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | resource-type', function (hooks) {
  setupTest(hooks);

  // TODO: Replace this with your real tests.
  test('it exists', function (assert) {
    let service = this.owner.lookup('service:resource-type');
    assert.ok(service);
  });
});
