import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { TYPE_SESSION_RECORDING_SSH } from 'api/models/session-recording';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Unit | Model | session-recording', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  test('it exists', function (assert) {
    let store = this.owner.lookup('service:store');
    let model = store.createRecord('session-recording', {});
    assert.ok(model);
  });

  test('it has isUnknown property and returns the expected values', async function (assert) {
    assert.expect(2);
    const store = this.owner.lookup('service:store');
    const modelA = store.createRecord('session-recording', {
      type: TYPE_SESSION_RECORDING_SSH,
    });
    const modelB = store.createRecord('session-recording', {
      type: 'no-such-type',
    });
    assert.false(modelA.isUnknown);
    assert.true(modelB.isUnknown);
  });

  test('it has isSSH property and returns the expected values', async function (assert) {
    assert.expect(2);
    const store = this.owner.lookup('service:store');
    const modelA = store.createRecord('session-recording', {
      type: TYPE_SESSION_RECORDING_SSH,
    });
    const modelB = store.createRecord('session-recording', {
      type: 'random',
    });
    assert.true(modelA.isSSH);
    assert.false(modelB.isSSH);
  });

  test('it has connections as a relationship', async function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('session-recording', {
      type: TYPE_SESSION_RECORDING_SSH,
      connection_recordings: [store.createRecord('connection-recording')],
    });

    const connection_recordings = await model.connection_recordings;
    assert.strictEqual(connection_recordings.length, 1);
  });
});
