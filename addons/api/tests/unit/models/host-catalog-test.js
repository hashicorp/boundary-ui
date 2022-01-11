import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | host catalog', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let store = this.owner.lookup('service:store');
    let model = store.createRecord('host-catalog', {});
    assert.ok(model);
  });

  test('it has isPlugin function and returns the expected values', async function (assert) {
    assert.expect(3);
    const store = this.owner.lookup('service:store');
    const modelPlugin = store.createRecord('host-catalog', { type: 'plugin' });
    const modelStatic = store.createRecord('host-catalog', { type: 'static' });
    assert.equal(typeof modelPlugin.isPlugin, 'boolean');
    assert.true(modelPlugin.isPlugin);
    assert.false(modelStatic.isPlugin);
  });

  test('it has isAWS function and returns the expected values', async function (assert) {
    assert.expect(3);
    const store = this.owner.lookup('service:store');
    const modelAws = store.createRecord('host-catalog', {
      plugin: { name: 'aws' },
    });
    const modelRandom = store.createRecord('host-catalog', {
      plugin: { name: 'random' },
    });
    assert.equal(typeof modelAws.isAWS, 'boolean');
    assert.true(modelAws.isAWS);
    assert.false(modelRandom.isAWS);
  });

  test('it has isAzure function and return the expected values', async function (assert) {
    assert.expect(3);
    const store = this.owner.lookup('service:store');
    const modelAzure = store.createRecord('host-catalog', {
      plugin: { name: 'azure' },
    });
    const modelRandom = store.createRecord('host-catalog', {
      plugin: { name: 'random' },
    });
    assert.equal(typeof modelAzure.isAzure, 'boolean');
    assert.true(modelAzure.isAzure);
    assert.false(modelRandom.isAzure);
  });
});
