import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | host catalog', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let store = this.owner.lookup('service:store');
    let model = store.createRecord('host-catalog', {});
    assert.ok(model);
  });

  test('it has isStatic function and returns the expected values', async function (assert) {
    assert.expect(3);
    const store = this.owner.lookup('service:store');
    const modelA = store.createRecord('host-catalog', { type: 'static' });
    const modelB = store.createRecord('host-catalog', { type: 'plugin' });
    assert.equal(typeof modelA.isStatic, 'boolean');
    assert.true(modelA.isStatic);
    assert.false(modelB.isStatic);
  });
});
