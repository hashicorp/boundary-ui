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
   * @type {boolean}
   */
  get canSetPassword() {
    return this.hasAuthorizedAction('set-password');
  }
}
