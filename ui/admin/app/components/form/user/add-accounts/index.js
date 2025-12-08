/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { A } from '@ember/array';
import { service } from '@ember/service';

export default class FormUserAddAccountsComponent extends Component {
  // =properties
  @service abilities;
  /**
   * Array of selected account IDs.
   * @type {EmberArray}
   */
  selectedAccountIDs = A();

  /**
   * Checks for unassigned accounts.
   * @param {[AccountModel]} filteredAccounts
   * @type {boolean}
   */
  get hasAvailableAccounts() {
    return this.filteredAccounts.length > 0;
  }

  /**
   * Accounts not already added to the user.
   * @type {[AccountModel]}
   */
  get filteredAccounts() {
    // Get IDs for accounts already added to the current user
    const alreadyAddedAccountIDs = this.args.model.account_ids;
    const notAddedAccounts = this.args.accounts.filter(
      (account) =>
        !alreadyAddedAccountIDs.includes(account.id) &&
        this.abilities.can('addAccount user', this.args.model, { account }),
    );
    return notAddedAccounts;
  }

  // =actions

  /**
   * Toggle account selection
   * @param {string} accountId
   */
  @action
  toggleAccount(accountId) {
    if (!this.selectedAccountIDs.includes(accountId)) {
      this.selectedAccountIDs.addObject(accountId);
    } else {
      this.selectedAccountIDs.removeObject(accountId);
    }
  }

  @action
  submit(fn) {
    fn(this.selectedAccountIDs);
  }
}
