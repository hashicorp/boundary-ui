/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ScopesScopeSessionRecordingsSessionRecordingChannelsByConnectionRoute extends Route {
  // =services
  @service store;
  @service session;
  @service router;
  // =methods

  /**
   * If arriving here unauthenticated, redirect to index for further processing.
   */
  beforeModel() {
    if (!this.session.isAuthenticated) this.router.transitionTo('index');
  }

  /**
   * Load session recording (already in store) and related storage bucket if present
   * @return {{sessionRecording: SessionRecordingModel, storageBucket: ?StorageBucketModel}}
   */
  async model() {
    let storageBucket = null;

    const sessionRecording = this.modelFor(
      'scopes.scope.session-recordings.session-recording',
    );

    try {
      if (sessionRecording.storage_bucket_id) {
        const { storage_bucket_id } = sessionRecording;
        storageBucket = await this.store.findRecord(
          'storage-bucket',
          storage_bucket_id,
        );
      }
    } catch (e) {
      // no op
    }

    return {
      sessionRecording,
      storageBucket,
    };
  }
}
