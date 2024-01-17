/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import SessionRecordingAbility from 'api/abilities/session-recording';
import { inject as service } from '@ember/service';

export default class OverrideSessionRecordingAbility extends SessionRecordingAbility {
  // =service
  @service features;

  /**
   * This override ensures that session recordings may be read only if the
   * session-recording feature flag is enabled.
   */
  get canRead() {
    return this.features.isEnabled('ssh-session-recording')
      ? super.canRead
      : false;
  }

  /**
   * Attaching a policy is allowed only if the feature flag is enabled
   * @type {boolean}
   */
  get canReapplyStoragePolicy() {
    return this.features.isEnabled('ssh-session-recording')
      ? this.hasAuthorizedAction('reapply-storage-policy')
      : false;
  }
}
