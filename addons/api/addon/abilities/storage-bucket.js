/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
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
