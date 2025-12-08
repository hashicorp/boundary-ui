/**
 * Copyright (c) HashiCorp, Inc.
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

  let abilitiesService;
  let store;

  hooks.beforeEach(function () {
    abilitiesService = this.owner.lookup('service:abilities');
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
      abilitiesService.can(
        'download session-recording',
        recordingWithAuthorizedAction,
      ),
    );
    assert.false(
      abilitiesService.can(
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
      abilitiesService.can(
        'delete session-recording',
        recordingNotinAvaialableState,
      ),
    );
    assert.true(
      abilitiesService.can(
        'delete session-recording',
        recordingInAvailableState,
      ),
    );
  });

  test('can re-apply Storage policy with proper authorization', function (assert) {
    const recording = store.createRecord('session', {
      authorized_actions: ['reapply-storage-policy'],
    });

    assert.true(
      abilitiesService.can('reapplyStoragePolicy session-recording', recording),
    );
  });
});
