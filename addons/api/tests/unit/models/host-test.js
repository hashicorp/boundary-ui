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

  test('it has isStatic function and returns the expected values', async function (assert) {
    assert.expect(3);
    const store = this.owner.lookup('service:store');
    const modelA = store.createRecord('host', { type: 'static' });
    const modelB = store.createRecord('host', { type: 'plugin' });
    assert.equal(typeof modelA.isStatic, 'boolean');
    assert.true(modelA.isStatic);
    assert.false(modelB.isStatic);
  });
});
