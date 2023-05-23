/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import StorageBucketAbility from 'api/abilities/storage-bucket';
import { inject as service } from '@ember/service';

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
   * TODO: Ensure that storage buckets may be deleted only if the
   * session-recording feature flag is enabled.
   * For now a storage bucket cannot be deleted.
   */
  get canDelete() {
    return false;
    // return this.features.isEnabled('ssh-session-recording')
    //   ? super.canDelete
    //   : false;
  }
}
