/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import {
  STATE_SESSION_RECORDING_AVAILABLE,
  STATE_SESSION_RECORDING_STARTED,
  TYPE_SESSION_RECORDING_SSH,
} from 'api/models/session-recording';

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

  test('can download when a recording has download authorization', function (assert) {
    const recordingWithAuthorizedAction = store.createRecord(
      'session-recording',
      {
        authorized_actions: ['download'],
      },
    );
    const recordingWithoutAuthorizedAction = store.createRecord(
      'session-recording',
      {
        authorized_actions: [],
      },
    );

    assert.true(
      canService.can(
        'download session-recording',
        recordingWithAuthorizedAction,
      ),
    );
    assert.false(
      canService.can(
        'download session-recording',
        recordingWithoutAuthorizedAction,
      ),
    );
  });

  test('can delete a session with proper authorization and in available state', function (assert) {
    const recordingNotinAvaialableState = store.createRecord(
      'session-recording',
      {
        authorized_actions: ['delete'],
        type: TYPE_SESSION_RECORDING_SSH,
        state: STATE_SESSION_RECORDING_STARTED,
      },
    );
    const recordingInAvailableState = store.createRecord('session-recording', {
      authorized_actions: ['delete'],
      type: TYPE_SESSION_RECORDING_SSH,
      state: STATE_SESSION_RECORDING_AVAILABLE,
    });
    assert.false(
      canService.can('delete session-recording', recordingNotinAvaialableState),
    );
    assert.true(
      canService.can('delete session-recording', recordingInAvailableState),
    );
  });

  test('can re-apply Storage policy with proper authorization', function (assert) {
    const recording = store.createRecord('session', {
      authorized_actions: ['reapply-storage-policy'],
    });

    assert.true(
      canService.can('reapplyStoragePolicy session-recording', recording),
    );
  });
});
