/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ScopesScopeSessionRecordingsSessionRecordingChannelsByConnectionChannelRoute extends Route {
  // =services
  @service store;
  @service can;
  @service router;

  // =methods
  /**
   *
   * @param {string} channel_id
   * @returns {channelRecording: Object, sessionRecording: Object, storageBucket: Object}
   */
  model({ channel_id }) {
    const { sessionRecording, storageBucket } = this.modelFor(
      'scopes.scope.session-recordings.session-recording.channels-by-connection',
    );
    const channelRecording = this.store.peekRecord(
      'channel-recording',
      channel_id,
    );

    return {
      channelRecording,
      sessionRecording,
      storageBucket,
    };
  }

  /**
   * Redirects to route with correct session-recording id if incorrect.
   * @param {channelRecording: Object, sessionRecording: Object, storageBucket: Object} model
   */
  redirect(model) {
    const { channelRecording, sessionRecording } = model;
    const session_recording_id =
      channelRecording.connection_recording.session_recording.id;
    if (session_recording_id !== sessionRecording.id) {
      this.router.replaceWith(
        'scopes.scope.session-recordings.session-recording.channels-by-connection.channel',
        session_recording_id,
        channelRecording.id,
      );
    }
  }
}
