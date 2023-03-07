import Route from '@ember/routing/route';

export default class ScopesScopeSessionRecordingsSessionRecordingRoute extends Route {
  // =services
  // =methods
  model() {
    return {
      session_recording_id: 'sr_1234567890',
      channel_connection_id: 'srcc_1234567890',
    };
  }
}
