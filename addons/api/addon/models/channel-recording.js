import GeneratedChannelRecordingModel from '../generated/models/channel-recording';
import { belongsTo } from '@ember-data/model';

export default class ChannelRecordingModel extends GeneratedChannelRecordingModel {
  @belongsTo('connection-recording') connection_recording;

  /**
   * Download the ascii cast recording for this channel.
   * @returns {Promise<string>}
   */
  getAsciicast() {
    const adapter = this.store.adapterFor('session-recording');
    return adapter.getAsciicast(this.id);
  }
}
