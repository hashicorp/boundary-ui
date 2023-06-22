/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import GeneratedSessionRecordingModel from '../generated/models/session-recording';
import { hasMany } from '@ember-data/model';
import { inject as service } from '@ember/service';

export const TYPE_SESSION_RECORDING_SSH = 'ssh';
export const TYPES_SESSION_RECORDING = Object.freeze([
  TYPE_SESSION_RECORDING_SSH,
]);

export const STATE_SESSION_RECORDING_STARTED = 'started';
export const STATE_SESSION_RECORDING_AVAILABLE = 'available';
export const STATE_SESSION_RECORDING_UNKNOWN = 'unknown';

export default class SessionRecordingModel extends GeneratedSessionRecordingModel {
  @hasMany('connection-recording', { async: false }) connection_recordings;

  @service store;

  /**
   * True if the session recording type is `ssh`.
   * @type {boolean}
   */
  get isSSH() {
    return this.type === TYPE_SESSION_RECORDING_SSH;
  }

  /**
   * True if the session recording is an unknown type.
   * @type {boolean}
   */
  get isUnknown() {
    return !TYPES_SESSION_RECORDING.includes(this.type);
  }

  /**
   * True if the session recording is in an available state.
   * @type {boolean}
   */
  get isAvailable() {
    return this.state === STATE_SESSION_RECORDING_AVAILABLE;
  }

  /**
   * Returns scope name or scope id from the target that belongs to the session recording.
   * @type {string}
   */
  get targetScopeDisplayName() {
    return (
      this.create_time_values?.target?.scope?.name ||
      this.create_time_values?.target?.scope?.id
    );
  }

  /**
   * Returns the user name or user id that belongs to the session recording.
   * @type {string}
   */
  get userDisplayName() {
    return (
      this.create_time_values?.user?.name || this.create_time_values?.user?.id
    );
  }
}
