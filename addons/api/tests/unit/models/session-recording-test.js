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

  test('it has targetScopeDisplayName and returns the expected values', async function (assert) {
    assert.expect(2);
    const store = this.owner.lookup('service:store');
    const fakeName = 'Scope name';
    const fakeId = 's_123456789';
    // Scope models: A has just name, B has just id.
    const scopeModelA = await store.createRecord('scope', {
      type: 'global',
      name: fakeName,
      id: 's_1234567890',
    });
    const scopeModelB = await store.createRecord('scope', {
      type: 'org',
      id: fakeId,
    });

    const targetModelA = await store.createRecord('target', {
      scope: scopeModelA,
    });
    const targetModelB = await store.createRecord('target', {
      scope: scopeModelB,
    });

    const modelA = store.createRecord('session-recording', {
      target: targetModelA,
    });
    const modelB = store.createRecord('session-recording', {
      target: targetModelB,
    });

    assert.strictEqual(modelA.targetScopeDisplayName, fakeName);
    assert.strictEqual(modelB.targetScopeDisplayName, fakeId);
  });
});
