/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { service } from '@ember/service';
import {
  STATE_SESSION_RECORDING_STARTED,
  STATE_SESSION_RECORDING_AVAILABLE,
  STATE_SESSION_RECORDING_UNKNOWN,
} from 'api/models/session-recording';

export default class SessionRecordingStatusComponent extends Component {
  // =services
  @service intl;

  // =attributes
  get status() {
    switch (this.args.status) {
      case STATE_SESSION_RECORDING_STARTED: // In progress
        return {
          icon: 'circle-dot',
          color: 'neutral',
          text: this.intl.t('states.recording'),
        };
      case STATE_SESSION_RECORDING_AVAILABLE: // Completed
        return {
          icon: 'check-circle',
          color: 'success',
          text: this.intl.t('states.completed'),
        };
      case STATE_SESSION_RECORDING_UNKNOWN: // Error
      default:
        return {
          icon: 'alert-triangle',
          color: 'critical',
          text: this.intl.t('states.failed'),
        };
    }
  }
}
