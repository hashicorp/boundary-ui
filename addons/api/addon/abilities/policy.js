/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import ModelAbility from './model';
import { service } from '@ember/service';

/**
 * Provides abilities for storage policies.
 */
export default class PolicyAbility extends ModelAbility {
  // =services
  @service features;
  // =permissions

  /**
   * This ensures that storage policies may be read only if the
   * session-recording feature flag is enabled.
   */
  get canRead() {
    return this.features.isEnabled('ssh-session-recording')
      ? super.canRead
      : false;
  }

  /**
   * This ensures that storage policies may be updated only if the
   * session-recording feature flag is enabled.
   */
  get canUpdate() {
    return this.features.isEnabled('ssh-session-recording')
      ? super.canUpdate
      : false;
  }

  /**
   * This ensures that storage policies may be deleted only if the
   * session-recording feature flag is enabled.
   */
  get canDelete() {
    return this.features.isEnabled('ssh-session-recording')
      ? super.canDelete
      : false;
  }
}
