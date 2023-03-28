import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | channel-recording', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let store = this.owner.lookup('service:store');
    let model = store.createRecord('channel-recording', {});
    assert.ok(model);
  });
});
