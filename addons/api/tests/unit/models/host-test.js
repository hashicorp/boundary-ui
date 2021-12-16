import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | host', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    assert.expect(1);
    let store = this.owner.lookup('service:store');
    let model = store.createRecord('host', {});
    assert.ok(model);
  });

  test('it contains attributes', function (assert) {
    assert.expect(1);
    let store = this.owner.lookup('service:store');
    let model = store.createRecord('host', {
      type: 'static',
      attributes: {
        address: '127.0.0.1',
      },
    });
    assert.equal(model.attributes.address, '127.0.0.1');
  });
});
