import GeneratedChannelRecordingModel from '../generated/models/channel-recording';
import { belongsTo } from '@ember-data/model';

export const TYPE_CHANNEL_RECORDING_SESSION = 'session';
export const TYPES_CHANNEL_RECORDING = Object.freeze([
  TYPE_CHANNEL_RECORDING_SESSION,
]);

export default class ChannelRecordingModel extends GeneratedChannelRecordingModel {
  @belongsTo('connection-recording') connection_recording;

  /**
   * True if the channel type is `session`.
   * @type {boolean}
   */
  get isSession() {
    return this.type === TYPE_CHANNEL_RECORDING_SESSION;
  }

  /**
   * True if the channel is an unknown type.
   * @type {boolean}
   */
  get isUnknown() {
    return !TYPES_CHANNEL_RECORDING.includes(this.type);
  }

  /**
   * Download the ascii cast recording for this channel.
   * @returns {Promise<string>}
   */
  getAsciicast() {
    const adapter = this.store.adapterFor('session-recording');
    return adapter.getAsciicast(this.id);
  }
}
