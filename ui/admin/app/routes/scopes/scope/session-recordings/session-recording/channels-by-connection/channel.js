import Route from '@ember/routing/route';

export default class ScopesScopeSessionRecordingsSessionRecordingChannelsByConnectionChannelRoute extends Route {
  async model() {
    const response = await fetch('/session.cast');
    const asciicast = await response.text();

    return {
      scope_id: 'srcc_1234567890',
      asciicast: asciicast,
    };
  }
}
