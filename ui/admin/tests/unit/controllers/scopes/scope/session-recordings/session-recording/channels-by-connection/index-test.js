/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { setupTest } from 'admin/tests/helpers';
import {
  STATE_SESSION_RECORDING_AVAILABLE,
  STATE_SESSION_RECORDING_STARTED,
  STATE_SESSION_RECORDING_UNKNOWN,
} from 'api/models/session-recording';

module(
  'Unit | Controller | scopes/scope/session-recordings/session-recording/channels-by-connection/index',
  function (hooks) {
    setupTest(hooks);

    test('isSessionInprogressWithNoConnections returns true if session has started with no connections', function (assert) {
      const store = this.owner.lookup('service:store');
      const controller = this.owner.lookup(
        'controller:scopes/scope/session-recordings/session-recording/channels-by-connection/index'
      );

      const sessionRecording = store.createRecord('session-recording', {
        state: STATE_SESSION_RECORDING_STARTED,
        connection_recordings: [],
      });
      controller.set('model', { sessionRecording });

      assert.true(controller.isSessionInprogressWithNoConnections);
    });

    test('isSessionInprogressWithNoConnections returns false if session has started and has connections', function (assert) {
      const store = this.owner.lookup('service:store');
      const controller = this.owner.lookup(
        'controller:scopes/scope/session-recordings/session-recording/channels-by-connection/index'
      );

      const sessionRecording = store.createRecord('session-recording', {
        state: STATE_SESSION_RECORDING_STARTED,
        connection_recordings: [store.createRecord('connection-recording')],
      });
      controller.set('model', { sessionRecording });

      assert.false(controller.isSessionInprogressWithNoConnections);
    });

    test('isSessionInprogressWithNoConnections returns false if session is complete and has connections', function (assert) {
      const store = this.owner.lookup('service:store');
      const controller = this.owner.lookup(
        'controller:scopes/scope/session-recordings/session-recording/channels-by-connection/index'
      );

      const sessionRecording = store.createRecord('session-recording', {
        state: STATE_SESSION_RECORDING_AVAILABLE,
        connection_recordings: [store.createRecord('connection-recording')],
      });
      controller.set('model', { sessionRecording });

      assert.false(controller.isSessionInprogressWithNoConnections);
    });

    test('isSessionUnknownWithNoConnections returns true if session is unknown with no connections', function (assert) {
      const store = this.owner.lookup('service:store');
      const controller = this.owner.lookup(
        'controller:scopes/scope/session-recordings/session-recording/channels-by-connection/index'
      );

      const sessionRecording = store.createRecord('session-recording', {
        state: STATE_SESSION_RECORDING_UNKNOWN,
        connection_recordings: [],
      });
      controller.set('model', { sessionRecording });

      assert.true(controller.isSessionUnknownWithNoConnections);
    });

    test('isSessionUnknownWithNoConnections returns false if session is unknown and has connections', function (assert) {
      const store = this.owner.lookup('service:store');
      const controller = this.owner.lookup(
        'controller:scopes/scope/session-recordings/session-recording/channels-by-connection/index'
      );

      const sessionRecording = store.createRecord('session-recording', {
        state: STATE_SESSION_RECORDING_UNKNOWN,
        connection_recordings: [store.createRecord('connection-recording')],
      });
      controller.set('model', { sessionRecording });

      assert.false(controller.isSessionUnknownWithNoConnections);
    });

    test('isSessionUnknownWithNoConnections returns false if session is complete and has connections', function (assert) {
      const store = this.owner.lookup('service:store');
      const controller = this.owner.lookup(
        'controller:scopes/scope/session-recordings/session-recording/channels-by-connection/index'
      );

      const sessionRecording = store.createRecord('session-recording', {
        state: STATE_SESSION_RECORDING_AVAILABLE,
        connection_recordings: [store.createRecord('connection-recording')],
      });
      controller.set('model', { sessionRecording });

      assert.false(controller.isSessionUnknownWithNoConnections);
    });
  }
);
