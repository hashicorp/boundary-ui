import { module, test } from 'qunit';
import { setupTest } from 'admin/tests/helpers';

module('Unit | Service | breadcrumbs', function (hooks) {
  setupTest(hooks);

  // TODO: Replace this with your real tests.
  test('it exists', function (assert) {
    let service = this.owner.lookup('service:breadcrumbs');
    assert.ok(service);
  });
});
