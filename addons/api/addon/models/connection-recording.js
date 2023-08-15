/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
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
