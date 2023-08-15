/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import GeneratedChannelRecordingModel from '../generated/models/channel-recording';
import { belongsTo } from '@ember-data/model';

export const MIME_TYPE_ASCIICAST = 'application/x-asciicast';

export default class ChannelRecordingModel extends GeneratedChannelRecordingModel {
  @belongsTo('connection-recording', {
    async: false,
    inverse: 'channel_recordings',
  })
  connection_recording;

  /**
   * True if the channel supports asciicast.
   * @type {boolean}
   */
  get isAsciicast() {
    return this.mime_types?.includes(MIME_TYPE_ASCIICAST) ?? false;
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
