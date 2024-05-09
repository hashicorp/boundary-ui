import { module, test } from 'qunit';
import { setupTest } from 'admin/tests/helpers';

module('Unit | Route | help', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let route = this.owner.lookup('route:help');
    assert.ok(route);
  });
});
