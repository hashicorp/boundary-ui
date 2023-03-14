import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ScopesScopeSessionRecordingsSessionRecordingChannelsByConnectionChannelRoute extends Route {
  // =services
  @service store;

  // =methods
  async model({ channel_id }) {
    const response = await fetch('/session.cast');
    const asciicast = await response.text();

    return {
      channel_id: channel_id,
      asciicast: asciicast,
    };
  }
}
