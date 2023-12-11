import { module, test } from 'qunit';
import { setupTest } from 'admin/tests/helpers';

module('Unit | Service | accountActions', function (hooks) {
  setupTest(hooks);

  // TODO: Replace this with your real tests.
  test('it exists', function (assert) {
    let service = this.owner.lookup('service:account-actions');
    assert.ok(service);
  });
});
