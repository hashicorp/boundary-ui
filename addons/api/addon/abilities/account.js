/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
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
   * @type {boolean}
   */
  get canSetPassword() {
    return this.hasAuthorizedAction('set-password');
  }
}
