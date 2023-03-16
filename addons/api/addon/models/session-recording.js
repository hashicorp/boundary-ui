import GeneratedSessionRecordingModel from '../generated/models/session-recording';
import { hasMany } from '@ember-data/model';
import { inject as service } from '@ember/service';

export const TYPE_SESSION_RECORDING_SSH = 'ssh';
export const TYPES_SESSION_RECORDING = Object.freeze([
  TYPE_SESSION_RECORDING_SSH,
]);

export default class SessionRecordingModel extends GeneratedSessionRecordingModel {
  @hasMany('connection-recording') connection_recordings;

  @service store;

  /**
   * True if the session recording type is `ssh`.
   * @type {boolean}
   */
  get isSSH() {
    return this.type === TYPE_SESSION_RECORDING_SSH;
  }

  /**
   * True if the session recording is an unknown type.
   * @type {boolean}
   */
  get isUnknown() {
    return !TYPES_SESSION_RECORDING.includes(this.type);
  }

  getAsciiCast({ connectionId, channelId, mimeType }) {
    const adapter = this.store.adapterFor('application');
    const options = { adapterOptions: { method: 'download' } };
    const url = adapter.buildURL(
      'session-recording',
      this.id,
      options,
      'findRecord'
    );
    return adapter.ajax(url, 'GET', {
      data: { connectionId, channelId, mimeType },
    });
  }
}
