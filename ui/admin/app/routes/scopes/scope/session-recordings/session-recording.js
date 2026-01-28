/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { paramValueFinder } from 'admin/utils/param-value-finder';

export default class ScopesScopeSessionRecordingsSessionRecordingRoute extends Route {
  // =services
  @service store;
  @service session;
  @service router;
  @service can;

  // =methods

  /**
   * If arriving here unauthenticated, redirect to index for further processing.
   */
  beforeModel() {
    if (!this.session.isAuthenticated) this.router.transitionTo('index');
  }

  /**
   * Load session recording.
   * @return {sessionRecording: SessionRecordingModel}
   */
  async model({ session_recording_id }) {
    const sessionRecording = await this.store.findRecord(
      'session-recording',
      session_recording_id,
      // Set reload to true to always force an API call. The downstream peekRecord
      // for channels will resolve before the session recording is returned otherwise.
      { reload: true },
    );

    return sessionRecording;
  }

  /**
   * Redirects to route with correct scope id if incorrect.
   * @param {SessionRecordingModel} sessionRecording
   * @param {object} transition
   */
  redirect(sessionRecording, transition) {
    const scope = this.modelFor('scopes.scope');
    if (sessionRecording.scopeID !== scope.id) {
      const paramValues = paramValueFinder(
        'session-recording',
        transition.to.parent,
      );
      this.router.replaceWith(
        transition.to.name,
        sessionRecording.scopeID,
        sessionRecording.id,
        ...paramValues,
      );
    }
  }
}
