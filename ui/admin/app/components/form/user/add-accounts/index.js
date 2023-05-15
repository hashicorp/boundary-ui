/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Component from '@glimmer/component';
import { computed, action } from '@ember/object';
import { A } from '@ember/array';
import { inject as service } from '@ember/service';

export default class FormUserAddAccountsComponent extends Component {
  //service
  @service can;

  // =properties

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
  @computed('filteredAccounts.length')
  get hasAvailableAccounts() {
    return this.filteredAccounts.length > 0;
  }

  /**
   * Accounts not already added to the user.
   * @type {[AccountModel]}
   */
  @computed('args.{accounts.[],model.account_ids.[]}', 'can')
  get filteredAccounts() {
    // Get IDs for accounts already added to the current user
    const alreadyAddedAccountIDs = this.args.model.account_ids;
    const notAddedAccounts = this.args.accounts.filter(
      (account) =>
        this.can.can('addAccount account', account) &&
        !alreadyAddedAccountIDs.includes(account.id)
    );
    return notAddedAccounts;
  }

  // =actions

  @action
  toggleAccount(account) {
    if (!this.selectedAccountIDs.includes(account.id)) {
      this.selectedAccountIDs.addObject(account.id);
    } else {
      this.selectedAccountIDs.removeObject(account.id);
    }
  }

  @action
  submit(fn) {
    fn(this.selectedAccountIDs);
  }
}
