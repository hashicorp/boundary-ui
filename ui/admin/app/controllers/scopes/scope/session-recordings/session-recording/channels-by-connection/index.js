import Controller from '@ember/controller';
import {
  STATE_SESSION_RECORDING_STARTED,
  STATE_SESSION_RECORDING_UNKNOWN,
} from 'api/models/session-recording';

export default class ScopesScopeSessionRecordingsSessionRecordingChannelsByConnectionIndexController extends Controller {
  /**
   * Returns true if the session recording has started
   * but has not started any connections
   * @type {boolean}
   */
  get isSessionInprogressWithNoConnections() {
    return (
      this.model?.sessionRecording?.connection_recordings?.length === 0 &&
      this.model?.sessionRecording?.state === STATE_SESSION_RECORDING_STARTED
    );
  }

  /**
   * Returns true if the session recording state is unknown
   * and has no connections
   * @type {boolean}
   */
  get isSessionUnknownWithNoConnections() {
    return (
      this.model?.sessionRecording?.connection_recordings?.length === 0 &&
      this.model?.sessionRecording?.state === STATE_SESSION_RECORDING_UNKNOWN
    );
  }
}
