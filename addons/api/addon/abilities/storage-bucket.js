/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import ModelAbility from './model';

/**
 * Provides abilities for storage buckets.
 */
export default class StorageBucketAbility extends ModelAbility {
  // =services

  // =permissions

  /**
   * Only "known" storage bucket types may be read.
   * @type {boolean}
   */
  get canRead() {
    return !this.model.isUnknown && super.canRead;
  }

  /**
   * Only "known" storage bucket types may be updated.
   * @type {boolean}
   */
  get canUpdate() {
    return !this.model.isUnknown && super.canUpdate;
  }

  /**
   * Only "known" storage bucket types may be deleted.
   * @type {boolean}
   */
  get canDelete() {
    return !this.model.isUnknown && super.canDelete;
  }
}
