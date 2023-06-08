import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ScopesScopeSessionRecordingsSessionRecordingChannelsByConnectionChannelIndexRoute extends Route {
  // =services
  @service can;

  // =methods
  /**
   * @returns {channelRecording: Object, sessionRecording: Object, storageBucket: Object, asciicast: Object}
   */
  async model() {
    let asciicast;
    const { sessionRecording, storageBucket, channelRecording } = this.modelFor(
      'scopes.scope.session-recordings.session-recording.channels-by-connection.channel'
    );

    if (this.can.can('getAsciicast channel-recording', channelRecording)) {
      try {
        asciicast = await channelRecording.getAsciicast();
      } catch (e) {
        // no op
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
