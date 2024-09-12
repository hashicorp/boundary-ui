/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ScopesScopeSessionRecordingsSessionRecordingChannelsByConnectionChannelIndexRoute extends Route {
  // =services
  @service can;
  @service flashMessages;

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
        // Alert user of any error messages.
        e.errors?.forEach((error) => {
          this.flashMessages.danger(error.detail, {
            notificationType: 'error',
            sticky: true,
            dismiss: (flash) => flash.destroyMessage(),
          });
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
