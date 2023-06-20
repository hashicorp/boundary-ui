/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ScopesScopeSessionRecordingsSessionRecordingChannelsByConnectionChannelRoute extends Route {
  // =services
  @service store;

  // =methods
  /**
   *
   * @param {string} channel_id
   * @returns {channelRecording: Object, sessionRecording: Object, storageBucket: Object}
   */
  model({ channel_id }) {
    const { sessionRecording, storageBucket } = this.modelFor(
      'scopes.scope.session-recordings.session-recording.channels-by-connection'
    );
    const channelRecording = this.store.peekRecord(
      'channel-recording',
      channel_id
    );

    return {
      channelRecording,
      sessionRecording,
      storageBucket,
    };
  }
}
