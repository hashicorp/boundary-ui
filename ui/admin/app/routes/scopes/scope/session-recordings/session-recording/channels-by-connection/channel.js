import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ScopesScopeSessionRecordingsSessionRecordingChannelsByConnectionChannelRoute extends Route {
  // =services
  @service store;
  @service can;

  // =methods
  async model({ channel_id }) {
    let asciicast;
    const { sessionRecording, storageBucket } = await this.modelFor(
      'scopes.scope.session-recordings.session-recording'
    );
    const channelRecording = await this.store.peekRecord(
      'channel-recording',
      channel_id
    );

    if (this.can.can('getAsciicast channel-recording', channelRecording)) {
      asciicast = await channelRecording.getAsciicast();
    }

    return {
      channelRecording,
      sessionRecording,
      storageBucket,
      asciicast,
    };
  }
}
