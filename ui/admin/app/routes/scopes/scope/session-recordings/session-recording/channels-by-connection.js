/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { notifySuccess, notifyError } from 'core/decorators/notify';
import { STATE_SESSION_RECORDING_AVAILABLE } from 'api/models/session-recording';

export default class ScopesScopeSessionRecordingsSessionRecordingChannelsByConnectionRoute extends Route {
  // =services
  @service store;
  @service session;

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

  /**
   * Reapplies storage policy dates to session recording
   * @param {SessionRecordingModel}
   */
  @action
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess(({ state }) =>
    state === STATE_SESSION_RECORDING_AVAILABLE
      ? 'resources.policy.messages.reapply'
      : 'resources.policy.messages.later',
  )
  async reapplyStoragepolicy(sessionRecording) {
    await sessionRecording.reapplyStoragePolicy();
    super.refresh(...arguments);
  }
}
