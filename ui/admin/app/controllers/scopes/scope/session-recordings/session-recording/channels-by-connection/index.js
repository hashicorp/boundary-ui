/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller from '@ember/controller';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { loading } from 'ember-loading';
import { confirm } from 'core/decorators/confirm';
import { notifySuccess, notifyError } from 'core/decorators/notify';
import {
  STATE_SESSION_RECORDING_STARTED,
  STATE_SESSION_RECORDING_UNKNOWN,
} from 'api/models/session-recording';

export default class ScopesScopeSessionRecordingsSessionRecordingChannelsByConnectionIndexController extends Controller {
  // =services

  @service router;

  // =attributes

  /**
   * Returns true if the session recording has started
   * but has not started any connections.
   * @type {boolean}
   */
  get isSessionInprogressWithNoConnections() {
    return (
      this.model?.sessionRecording?.connection_recordings?.length === 0 &&
      this.model?.sessionRecording?.state === STATE_SESSION_RECORDING_STARTED
    );
  }

  /**
   * Returns true if the session recording state is unknown
   * and has no connections.
   * @type {boolean}
   */
  get isSessionUnknownWithNoConnections() {
    return (
      this.model?.sessionRecording?.connection_recordings?.length === 0 &&
      this.model?.sessionRecording?.state === STATE_SESSION_RECORDING_UNKNOWN
    );
  }

  // =actions

  /**
   * Reapplies storage policy dates to session recording.
   * @param {SessionRecordingModel}
   */
  @action
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess(({ end_time }) =>
    !end_time
      ? 'resources.policy.messages.later'
      : 'resources.policy.messages.reapply',
  )
  async reapplyStoragePolicy(sessionRecording) {
    try {
      await sessionRecording.reapplyStoragePolicy();
    } catch (e) {
      this.router.replaceWith('scopes.scope.session-recordings');
      this.router.refresh();
      throw new Error(e);
    }
  }

  /**
   * Deletes the session recording.
   * @param {SessionRecording} recording
   */
  @action
  @loading
  @confirm('resources.session-recording.questions.delete')
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('notifications.delete-success')
  async delete(sessionRecording) {
    try {
      await sessionRecording.destroyRecord();
      this.router.replaceWith('scopes.scope.session-recordings');
      await this.router.refresh('scopes.scope.session-recordings');
    } catch (e) {
      sessionRecording.rollbackAttributes();
      throw new Error(e);
    }
  }
}
