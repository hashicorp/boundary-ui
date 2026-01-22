/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMirage } from 'admin/tests/helpers/mirage';
import { setupIntl } from 'ember-intl/test-support';
import { authenticateSession } from 'ember-simple-auth/test-support';
import {
  STATE_SESSION_RECORDING_AVAILABLE,
  STATE_SESSION_RECORDING_STARTED,
  STATE_SESSION_RECORDING_UNKNOWN,
} from 'api/models/session-recording';

module(
  'Unit | Controller | scopes/scope/session-recordings/session-recording/channels-by-connection/index',
  function (hooks) {
    setupTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en-us');

    let store;
    let controller;
    let getSessionRecordingCount;

    const instances = {
      scopes: {
        global: null,
      },
      sessionRecording: null,
    };

    hooks.beforeEach(async function () {
      await authenticateSession({});
      store = this.owner.lookup('service:store');
      controller = this.owner.lookup(
        'controller:scopes/scope/session-recordings/session-recording/channels-by-connection/index',
      );

      instances.scopes.global = this.server.create('scope', { id: 'global' });
      instances.sessionRecording = this.server.create('session-recording', {
        scope: instances.scopes.global,
      });

      getSessionRecordingCount = () =>
        this.server.schema.sessionRecordings.all().models.length;
    });

    test('it exists', function (assert) {
      assert.ok(controller);
    });

    test('isSessionInprogressWithNoConnections returns true if session has started with no connections', function (assert) {
      const sessionRecording = store.createRecord('session-recording', {
        state: STATE_SESSION_RECORDING_STARTED,
        connection_recordings: [],
      });
      controller.set('model', { sessionRecording });

      assert.true(controller.isSessionInprogressWithNoConnections);
    });

    test('isSessionInprogressWithNoConnections returns false if session has started and has connections', function (assert) {
      const sessionRecording = store.createRecord('session-recording', {
        state: STATE_SESSION_RECORDING_STARTED,
        connection_recordings: [store.createRecord('connection-recording')],
      });
      controller.set('model', { sessionRecording });

      assert.false(controller.isSessionInprogressWithNoConnections);
    });

    test('isSessionInprogressWithNoConnections returns false if session is complete and has connections', function (assert) {
      const sessionRecording = store.createRecord('session-recording', {
        state: STATE_SESSION_RECORDING_AVAILABLE,
        connection_recordings: [store.createRecord('connection-recording')],
      });
      controller.set('model', { sessionRecording });

      assert.false(controller.isSessionInprogressWithNoConnections);
    });

    test('isSessionUnknownWithNoConnections returns true if session is unknown with no connections', function (assert) {
      const sessionRecording = store.createRecord('session-recording', {
        state: STATE_SESSION_RECORDING_UNKNOWN,
        connection_recordings: [],
      });
      controller.set('model', { sessionRecording });

      assert.true(controller.isSessionUnknownWithNoConnections);
    });

    test('isSessionUnknownWithNoConnections returns false if session is unknown and has connections', function (assert) {
      const sessionRecording = store.createRecord('session-recording', {
        state: STATE_SESSION_RECORDING_UNKNOWN,
        connection_recordings: [store.createRecord('connection-recording')],
      });
      controller.set('model', { sessionRecording });

      assert.false(controller.isSessionUnknownWithNoConnections);
    });

    test('isSessionUnknownWithNoConnections returns false if session is complete and has connections', function (assert) {
      const sessionRecording = store.createRecord('session-recording', {
        state: STATE_SESSION_RECORDING_AVAILABLE,
        connection_recordings: [store.createRecord('connection-recording')],
      });
      controller.set('model', { sessionRecording });

      assert.false(controller.isSessionUnknownWithNoConnections);
    });

    test('delete action destroys specified model', async function (assert) {
      const sessionRecording = await store.findRecord(
        'session-recording',
        instances.sessionRecording.id,
      );
      const sessionRecordingCount = getSessionRecordingCount();

      await controller.delete(sessionRecording);

      assert.strictEqual(getSessionRecordingCount(), sessionRecordingCount - 1);
    });

    test('reapplyStoragePolicy action applies storage policy to session recording', async function (assert) {
      const sessionRecording = await store.findRecord(
        'session-recording',
        instances.sessionRecording.id,
      );
      const deleteAfter = sessionRecording.delete_after;

      await controller.reapplyStoragePolicy(sessionRecording);

      assert.notEqual(sessionRecording.delete_after, deleteAfter);
    });
  },
);
