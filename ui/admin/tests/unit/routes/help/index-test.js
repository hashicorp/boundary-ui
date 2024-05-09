import { module, test } from 'qunit';
import { setupTest } from 'admin/tests/helpers';

module('Unit | Route | help/index', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let route = this.owner.lookup('route:help/index');
    assert.ok(route);
  });
});
