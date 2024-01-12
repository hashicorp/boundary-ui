import { module, test } from 'qunit';
import { setupTest } from 'desktop/tests/helpers';

module('Unit | Service | controller-check', function (hooks) {
  setupTest(hooks);

  // TODO: Replace this with your real tests.
  test('it exists', function (assert) {
    let service = this.owner.lookup('service:controller-check');
    assert.ok(service);
  });
});
