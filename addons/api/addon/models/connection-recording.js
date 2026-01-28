/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import GeneratedConnectionRecordingModel from '../generated/models/connection-recording';
import { belongsTo, hasMany } from '@ember-data/model';

export default class ConnectionRecordingModel extends GeneratedConnectionRecordingModel {
  @belongsTo('session-recording', {
    async: false,
    inverse: 'connection_recordings',
  })
  session_recording;
  @hasMany('channel-recording', {
    async: false,
    inverse: 'connection_recording',
  })
  channel_recordings;
}
