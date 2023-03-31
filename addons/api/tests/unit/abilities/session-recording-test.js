import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { TYPE_SESSION_RECORDING_SSH } from 'api/models/session-recording';

module('Unit | Ability | session-recording', function (hooks) {
  setupTest(hooks);

  let canService;
  let store;

  hooks.beforeEach(function () {
    canService = this.owner.lookup('service:can');
    store = this.owner.lookup('service:store');
  });

  test('it exists', function (assert) {
    const ability = this.owner.lookup('ability:session-recording');
    assert.ok(ability);
  });

  test('can download when an ssh recording has download authorization', function (assert) {
    assert.expect(2);

    const recordingWithAuthorizedAction = store.createRecord(
      'session-recording',
      {
        authorized_actions: ['download'],
        type: TYPE_SESSION_RECORDING_SSH,
      }
    );
    const recordingWithoutAuthorizedAction = store.createRecord(
      'session-recording',
      {
        authorized_actions: [],
        type: TYPE_SESSION_RECORDING_SSH,
      }
    );

    assert.true(
      canService.can(
        'download session-recording',
        recordingWithAuthorizedAction
      )
    );
    assert.false(
      canService.can(
        'download session-recording',
        recordingWithoutAuthorizedAction
      )
    );
  });

  test('cannot download when a recording is not ssh type', function (assert) {
    assert.expect(2);

    const recordingWithAuthorizedAction = store.createRecord(
      'session-recording',
      {
        authorized_actions: ['download'],
        type: 'unknown',
      }
    );
    const recordingWithoutAuthorizedAction = store.createRecord(
      'session-recording',
      {
        authorized_actions: [],
        type: 'unknown',
      }
    );

    assert.false(
      canService.can(
        'download session-recording',
        recordingWithAuthorizedAction
      )
    );
    assert.false(
      canService.can(
        'download session-recording',
        recordingWithoutAuthorizedAction
      )
    );
  });
});
