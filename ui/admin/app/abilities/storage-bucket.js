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
    return this.features.isEnabled('session-recording') ? super.canRead : false;
  }

  /**
   * This override ensures that storage buckets can only be presented in the global scope.
   */
  get canList() {
    return this.hasAuthorizedCollectionAction('list') && this.model.isGlobal;
  }

  get canNavigate() {
    return this.canCreate || this.canList;
  }
}
