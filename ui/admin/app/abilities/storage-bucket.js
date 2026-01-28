/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import StorageBucketAbility from 'api/abilities/storage-bucket';
import { service } from '@ember/service';

export default class OverrideStorageBucketAbility extends StorageBucketAbility {
  // =service
  @service features;

  /**
   * This override ensures that storage buckets may be read only if the
   * session-recording feature flag is enabled.
   */
  get canRead() {
    return this.features.isEnabled('ssh-session-recording')
      ? super.canRead
      : false;
  }

  /**
   * This override ensures that storage buckets may be updated only if the
   * session-recording feature flag is enabled.
   */
  get canUpdate() {
    return this.features.isEnabled('ssh-session-recording')
      ? super.canUpdate
      : false;
  }

  /**
   * This override ensures that storage buckets may be deleted only if the
   * session-recording feature flag is enabled.
   */
  get canDelete() {
    return this.features.isEnabled('ssh-session-recording')
      ? super.canDelete
      : false;
  }
}
