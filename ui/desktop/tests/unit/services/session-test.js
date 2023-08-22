import { module, test } from 'qunit';
import { setupTest } from 'desktop/tests/helpers';

module('Unit | Service | Session', function (hooks) {
  setupTest(hooks);

  // TODO: Replace this with your real tests.
  test('it exists', function (assert) {
    let service = this.owner.lookup('service:session');
    assert.ok(service);
  });
});
