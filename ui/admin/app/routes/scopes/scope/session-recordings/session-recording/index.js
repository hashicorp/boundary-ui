/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ScopesScopeSessionRecordingsSessionRecordingIndexRoute extends Route {
  // =services
  @service router;

  // =methods

  /**
   * Redirects to the sessionRecording type specific screen,
   * for now just SSH types are supported.
   * @param {SessionRecordingModel} sessionRecording
   */
  async afterModel(sessionRecording) {
    if (sessionRecording.isSSH) {
      this.router.transitionTo(
        'scopes.scope.session-recordings.session-recording.channels-by-connection',
        sessionRecording.id,
      );
    }
  }
}
