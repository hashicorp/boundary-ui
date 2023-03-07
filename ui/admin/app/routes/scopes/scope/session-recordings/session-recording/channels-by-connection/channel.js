import Route from '@ember/routing/route';

export default class ScopesScopeSessionRecordingsSessionRecordingChannelsByConnectionChannelRoute extends Route {
  async model() {
    // building ascii cast here to make player availabe until API is ready
    const castConfig = {
      version: 2,
      width: 124,
      height: 36,
      timestamp: 1670352594,
      env: { SHELL: '/bin/zsh', TERM: 'xterm-256color' },
    };
    const asciicast = `${JSON.stringify(castConfig)}
[2.676444, "o", "y"]
[2.788653, "o", "a"]
[2.868652, "o", "r"]
[3.001764, "o", "n"]
[3.167636, "o", " "]
[3.313668, "o", "t"]
[3.460527, "o", "e"]
[3.561983, "o", "s"]
[3.63678, "o", "t"]`;
    return {
      scope_id: 'srcc_1234567890',
      asciicast: asciicast,
    };
  }
}
