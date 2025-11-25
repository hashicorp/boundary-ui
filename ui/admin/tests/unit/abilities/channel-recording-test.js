/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { STATE_SESSION_RECORDING_AVAILABLE } from 'api/models/session-recording';
import { MIME_TYPE_ASCIICAST } from 'api/models/channel-recording';

module('Unit | Abilities | channel-recording', function (hooks) {
  setupTest(hooks);

  let abilitiesService;
  let store;
  let sessionRecording;
  let connectionRecording;
  let asciicastChannel;
  let noneAsciicastChannel;

  hooks.beforeEach(function () {
    abilitiesService = this.owner.lookup('service:abilities');
    store = this.owner.lookup('service:store');

    sessionRecording = store.createRecord('session-recording', {
      state: STATE_SESSION_RECORDING_AVAILABLE,
    });
    connectionRecording = store.createRecord('connection-recording', {
      session_recording: sessionRecording,
    });
    asciicastChannel = store.createRecord('channel-recording', {
      mime_types: [MIME_TYPE_ASCIICAST],
      connection_recording: connectionRecording,
    });
    noneAsciicastChannel = store.createRecord('channel-recording', {
      mime_types: null,
      connection_recording: connectionRecording,
    });
  });

  test('returns true if session recording complete and channel mime type is asciicast', function (assert) {
    assert.true(
      abilitiesService.can('play channel-recording', asciicastChannel),
    );
    assert.false(
      abilitiesService.can('play channel-recording', noneAsciicastChannel),
    );
  });

  test('returns false if session recording complete and channel mime type is not asciicast', function (assert) {
    assert.true(
      abilitiesService.can('viewOnly channel-recording', noneAsciicastChannel),
    );
    assert.false(
      abilitiesService.can('viewOnly channel-recording', asciicastChannel),
    );
  });
});
