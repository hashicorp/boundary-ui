import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { Origin } from 'desktop/services/origin';

module('Unit | Service | origin', function (hooks) {
  setupTest(hooks);

  // TODO: Replace this with your real tests.
  test('it exists', function (assert) {
    let service = this.owner.lookup('service:origin');
    assert.ok(service);
  });
});
