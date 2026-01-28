/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import ModelAbility from './model';
/**
 * Provides abilities for auth method.
 */
export default class AuthMethodAbility extends ModelAbility {
  // =permissions

  /**
   * Only "known" auth method types may be read.
   * @type {boolean}
   */
  get canRead() {
    return !this.model.isUnknown && this.hasAuthorizedAction('read');
  }

  /**
   * Only "known" auth method types may be updated.
   */
  get canUpdate() {
    return !this.model.isUnknown && this.hasAuthorizedAction('update');
  }

  /**
   * Only "known" auth method types may be deleted.
   */
  get canDelete() {
    return !this.model.isUnknown && this.hasAuthorizedAction('delete');
  }
}
