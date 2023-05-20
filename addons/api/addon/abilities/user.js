/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import ModelAbility from './model';

/**
 * Provides abilities for users.
 */
export default class UserAbility extends ModelAbility {
  // =permissions

  /**
   * @type {boolean}
   */
  get canAddAccounts() {
    return this.hasAuthorizedAction('add-accounts');
  }

  /**
   * @type {boolean}
   */
  get canRemoveAccounts() {
    return this.hasAuthorizedAction('remove-accounts');
  }

  /**
   * @type {boolean}
   */
  get canAddAccount() {
    const { account, canAddAccounts } = this;
    return canAddAccounts && !account.isUnknown;
  }

  /**
   * @type {boolean}
   */
  get canRemoveAccount() {
    const { account, canRemoveAccounts } = this;
    return canRemoveAccounts && !account.isUnknown;
  }
}
