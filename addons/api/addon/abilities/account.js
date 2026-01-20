/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import ModelAbility from './model';

/**
 * Provides abilities for accounts.
 */
export default class AccountAbility extends ModelAbility {
  // =permissions

  /**
   * Only "known" account types may be read.
   * @type {boolean}
   */
  get canRead() {
    return !this.model.isUnknown && this.hasAuthorizedAction('read');
  }

  /**
   * Only "known" account types may be updated.
   * @type {boolean}
   */
  get canUpdate() {
    return !this.model.isUnknown && this.hasAuthorizedAction('update');
  }

  /**
   * Only "known" account types may be deleted.
   * @type {boolean}
   */
  get canDelete() {
    return !this.model.isUnknown && this.hasAuthorizedAction('delete');
  }

  /**
   * @type {boolean}
   */
  get canSetPassword() {
    return this.hasAuthorizedAction('set-password');
  }
}
