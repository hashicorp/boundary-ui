import GeneratedConnectionRecordingModel from '../generated/models/connection-recording';
import { belongsTo, hasMany } from '@ember-data/model';

export default class ConnectionRecordingModel extends GeneratedConnectionRecordingModel {
  @belongsTo('session-recording') session_recording;
  @hasMany('channel-recording') channel_recordings;
}
