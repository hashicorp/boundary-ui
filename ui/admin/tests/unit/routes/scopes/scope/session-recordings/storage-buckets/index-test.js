import { module, test } from 'qunit';
import { setupTest } from 'admin/tests/helpers';

module('Unit | Route | scopes/scope/session-recordings/storage-buckets/index', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let route = this.owner.lookup('route:scopes/scope/session-recordings/storage-buckets/index');
    assert.ok(route);
  });
});
