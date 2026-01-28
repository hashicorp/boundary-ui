/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { MIME_TYPE_ASCIICAST } from 'api/models/channel-recording';
import { TYPE_SESSION_RECORDING_SSH } from 'api/models/session-recording';

module('Unit | Ability | channel-recording', function (hooks) {
  setupTest(hooks);

  let canService;
  let store;

  hooks.beforeEach(function () {
    canService = this.owner.lookup('service:can');
    store = this.owner.lookup('service:store');
  });

  test('it exists', function (assert) {
    const ability = this.owner.lookup('ability:channel-recording');
    assert.ok(ability);
  });

  test('it can download asciicast', function (assert) {
    const sessionRecordingModel = store.createRecord('session-recording', {
      authorized_actions: ['download'],
      type: TYPE_SESSION_RECORDING_SSH,
    });
    const connectionRecordingModel = store.createRecord(
      'connection-recording',
      {
        session_recording: sessionRecordingModel,
      },
    );
    const channelRecordingModel = store.createRecord('channel-recording', {
      mime_types: [MIME_TYPE_ASCIICAST],
      connection_recording: connectionRecordingModel,
    });

    assert.true(
      canService.can('getAsciicast channel-recording', channelRecordingModel),
    );
  });

  test('it cannot download asciicast without the correct mime type', function (assert) {
    const sessionRecordingModel = store.createRecord('session-recording', {
      authorized_actions: ['download'],
      type: TYPE_SESSION_RECORDING_SSH,
    });
    const connectionRecordingModel = store.createRecord(
      'connection-recording',
      {
        session_recording: sessionRecordingModel,
      },
    );
    const channelRecordingModel = store.createRecord('channel-recording', {
      mime_types: ['unknown'],
      connection_recording: connectionRecordingModel,
    });

    assert.false(
      canService.can('getAsciicast channel-recording', channelRecordingModel),
    );
  });
});
