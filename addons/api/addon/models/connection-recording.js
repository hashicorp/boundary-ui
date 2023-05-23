import GeneratedConnectionRecordingModel from '../generated/models/connection-recording';
import { belongsTo, hasMany } from '@ember-data/model';

export default class ConnectionRecordingModel extends GeneratedConnectionRecordingModel {
  @belongsTo('session-recording', { async: false }) session_recording;
  @hasMany('channel-recording', { async: false }) channel_recordings;
}
