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

  test('it has sortedConnectionsByStartTimeDesc property and returns the expected values', async function (assert) {
    assert.expect(3);
    const store = this.owner.lookup('service:store');
    const newestConnection = store.createRecord('connection-recording', {
      start_time: new Date('2023-01-02T00:00:00.999Z'),
    });
    const oldestConnection = store.createRecord('connection-recording', {
      start_time: new Date('2023-01-01T00:00:00.999Z'),
    });
    const model = store.createRecord('session-recording', {
      type: TYPE_SESSION_RECORDING_SSH,
      connection_recordings: [oldestConnection, newestConnection],
    });

    const sortedConnections = await model.sortedConnectionsByStartTimeDesc;
    assert.strictEqual(sortedConnections.length, 2);
    assert.strictEqual(
      sortedConnections[0].start_time,
      newestConnection.start_time
    );
    assert.strictEqual(
      sortedConnections[1].start_time,
      oldestConnection.start_time
    );
  });

  test('it has targetScopeDisplayName and returns the expected values', async function (assert) {
    assert.expect(2);
    const store = this.owner.lookup('service:store');
    const fakeName = 'Scope name';
    const fakeId = 's_123456789';

    const modelA = store.createRecord('session-recording', {
      create_time_values: {
        target: {
          scope: {
            name: fakeName,
            id: fakeId,
          },
        },
      },
    });
    const modelB = store.createRecord('session-recording', {
      create_time_values: {
        target: {
          scope: {
            id: fakeId,
          },
        },
      },
    });

    assert.strictEqual(modelA.targetScopeDisplayName, fakeName);
    assert.strictEqual(modelB.targetScopeDisplayName, fakeId);
  });

  test('it has userDisplayName and returns the expected values', async function (assert) {
    assert.expect(2);
    const store = this.owner.lookup('service:store');
    const fakeUserName = 'User name';
    const fakeUserId = 'userid';

    const userModelA = store.createRecord('session-recording', {
      create_time_values: {
        user: {
          name: fakeUserName,
          id: fakeUserId,
        },
      },
    });

    const userModelB = store.createRecord('session-recording', {
      create_time_values: {
        user: {
          id: fakeUserId,
        },
      },
    });

    assert.strictEqual(userModelA.userDisplayName, fakeUserName);
    assert.strictEqual(userModelB.userDisplayName, fakeUserId);
  });
});
