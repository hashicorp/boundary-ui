import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ScopesScopeSessionRecordingsSessionRecordingChannelsByConnectionChannelRoute extends Route {
  // =services
  @service store;

  // =methods
  async model({ channel_id }) {
    const { sessionRecording, storageBucket } = await this.modelFor(
      'scopes.scope.session-recordings.session-recording'
    );
    const channelRecording = await this.store.peekRecord(
      'channel-recording',
      channel_id
    );

    const response = await fetch('/session.cast');
    const asciicast = await response.text();

    return {
      channelRecording,
      sessionRecording,
      storageBucket,
      asciicast: asciicast,
    };
  }
}
