/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
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
   * Reapplying policy is allowed only if the feature flag is enabled
   * @type {boolean}
   */
  get canReapplyStoragePolicy() {
    return this.features.isEnabled('ssh-session-recording')
      ? this.hasAuthorizedAction('reapply-storage-policy')
      : false;
  }

  /**
   * This override ensures that session recordings may be deleted only if the
   * session-recording feature flag is enabled and policy allows deletion.
   */
  get canDelete() {
    const retainForever =
      this.model.retain_until?.toISOString() === '9999-12-31T23:23:23.999Z';
    return this.features.isEnabled('ssh-session-recording') && !retainForever
      ? super.canDelete
      : false;
  }
}
