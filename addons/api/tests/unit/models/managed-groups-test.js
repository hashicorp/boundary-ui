import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | managed groups', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let store = this.owner.lookup('service:store');
    let model = store.createRecord('managed-groups', {});
    assert.ok(model);
  });
});
