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
    return !this.model.isUnknown && this.hasAuthorizedAction('read');
  }

  /**
   * Storage buckets can only exist within global and org scopes.
   * @type {boolean}
   */
  get canCreate() {
    return (
      this.hasAuthorizedCollectionAction('create') &&
      (this.model.isGlobal || this.model.isOrg)
    );
  }

  get canList() {
    return (
      this.hasAuthorizedCollectionAction('list') &&
      (this.model.isGlobal || this.model.isOrg)
    );
  }
}
