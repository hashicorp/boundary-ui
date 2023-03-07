import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { TYPE_RECORDING_SSH } from 'api/models/recording';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Unit | Model | recording', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  test('it exists', function (assert) {
    let store = this.owner.lookup('service:store');
    let model = store.createRecord('recording', {});
    assert.ok(model);
  });

  test('it has isUnknown property and returns the expected values', async function (assert) {
    assert.expect(2);
    const store = this.owner.lookup('service:store');
    const modelA = store.createRecord('recording', {
      type: TYPE_RECORDING_SSH,
    });
    const modelB = store.createRecord('recording', {
      type: 'no-such-type',
    });
    assert.false(modelA.isUnknown);
    assert.true(modelB.isUnknown);
  });

  test('it has isSSH property and returns the expected values', async function (assert) {
    assert.expect(2);
    const store = this.owner.lookup('service:store');
    const modelA = store.createRecord('recording', {
      type: TYPE_RECORDING_SSH,
    });
    const modelB = store.createRecord('recording', {
      type: 'random',
    });
    assert.true(modelA.isSSH);
    assert.false(modelB.isSSH);
  });

  test('it has connections as a relationship', async function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('recording', {
      type: TYPE_RECORDING_SSH,
      connections: [store.createRecord('connection')],
    });

    const connections = await model.connections;
    assert.strictEqual(connections.length, 1);
  });
});
