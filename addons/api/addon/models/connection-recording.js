import GeneratedConnectionRecordingModel from '../generated/models/connection-recording';
import { belongsTo, hasMany } from '@ember-data/model';
import { sort } from '@ember/object/computed';

export default class ConnectionRecordingModel extends GeneratedConnectionRecordingModel {
  @belongsTo('session-recording', { async: false }) session_recording;
  @hasMany('channel-recording', { async: false }) channel_recordings;

  startTimeSortingDesc = ['start_time:desc'];
  @sort('channel_recordings', 'startTimeSortingDesc')
  sortedChannelsByStartTimeDesc;
}
