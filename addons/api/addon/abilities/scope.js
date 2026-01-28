/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import ModelAbility from './model';

/**
 * Provides abilities for scopes.
 */
export default class ScopeAbility extends ModelAbility {
  // =permissions
  /**
   * Permission that checks whether a policy can be attached to a scope
   * @type {boolean}
   */
  get canAttachStoragePolicy() {
    return this.hasAuthorizedAction('attach-storage-policy');
  }

  /**
   * Permission that checks whether a policy can be detached to a scope
   * @type {boolean}
   */
  get canDetachStoragePolicy() {
    return this.hasAuthorizedAction('detach-storage-policy');
  }
}
