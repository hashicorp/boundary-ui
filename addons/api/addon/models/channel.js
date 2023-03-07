import GeneratedChannelModel from '../generated/models/channel';
import { belongsTo } from '@ember-data/model';

export const TYPE_CHANNEL_SESSION = 'session';
export const TYPES_CHANNEL = Object.freeze([TYPE_CHANNEL_SESSION]);

export default class ChannelModel extends GeneratedChannelModel {
  @belongsTo('connection') connection;

  /**
   * True if the channel type is `session`.
   * @type {boolean}
   */
  get isSession() {
    return this.type === TYPE_CHANNEL_SESSION;
  }

  /**
   * True if the channel is an unknown type.
   * @type {boolean}
   */
  get isUnknown() {
    return !TYPES_CHANNEL.includes(this.type);
  }
}
