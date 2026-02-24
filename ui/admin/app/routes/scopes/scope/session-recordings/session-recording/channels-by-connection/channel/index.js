/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ScopesScopeSessionRecordingsSessionRecordingChannelsByConnectionChannelIndexRoute extends Route {
  // =services
  @service can;
  @service flashMessages;
  @service intl;

  // =methods
  /**
   * @returns {channelRecording: Object, sessionRecording: Object, storageBucket: Object, asciicast: Object}
   */
  async model() {
    let asciicast;
    const { sessionRecording, storageBucket, channelRecording } = this.modelFor(
      'scopes.scope.session-recordings.session-recording.channels-by-connection.channel',
    );

    if (this.can.can('getAsciicast channel-recording', channelRecording)) {
      try {
        asciicast = await channelRecording.getAsciicast();
      } catch (e) {
        // Alert user of error occurred during download.
        const error = e.errors[0];
        this.flashMessages.danger(error.detail, {
          color: 'critical',
          title: this.intl.t('states.error'),
          sticky: true,
          dismiss: (flash) => flash.destroyMessage(),
        });
      }
    }

    return {
      channelRecording,
      sessionRecording,
      storageBucket,
      asciicast,
    };
  }
}
