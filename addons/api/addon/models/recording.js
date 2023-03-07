import GeneratedRecordingModel from '../generated/models/recording';
import { hasMany } from '@ember-data/model';

export const TYPE_RECORDING_SSH = 'ssh';
export const TYPES_RECORDING = Object.freeze([TYPE_RECORDING_SSH]);

export default class RecordingModel extends GeneratedRecordingModel {
  @hasMany('connection') connections;

  /**
   * True if the recording type is `ssh`.
   * @type {boolean}
   */
  get isSSH() {
    return this.type === TYPE_RECORDING_SSH;
  }

  /**
   * True if the recording is an unknown type.
   * @type {boolean}
   */
  get isUnknown() {
    return !TYPES_RECORDING.includes(this.type);
  }
}
