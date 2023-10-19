/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { paramValueFinder } from 'admin/utils/route-info';

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
      { reload: true }
    );

    return sessionRecording;
  }

  redirect(sessionRecording, transition) {
    const scope = this.modelFor('scopes.scope');
    if (
      this.can.cannot('read session-recording', sessionRecording, {
        resource_id: sessionRecording.scopeID,
        collection_id: scope.id,
      })
    ) {
      const paramValues = paramValueFinder(
        'session-recording',
        transition.to.parent
      );
      this.router.transitionTo(
        transition.to.name,
        sessionRecording.scopeID,
        sessionRecording.id,
        ...paramValues
      );
    }
  }
}
