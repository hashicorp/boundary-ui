import Component from '@glimmer/component';
import { computed, action } from '@ember/object';
import { A } from '@ember/array';

export default class FormUserAddAccountsComponent extends Component {
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
  @computed('filteredAccounts.[]')
  get hasAvailableAccounts() {
    return this.filteredAccounts.length > 0;
  }

  /**
   * Accounts not already added to the user.
   * @type {[AccountModel]}
   */
  @computed('args.{accounts.[],model.account_ids.[]}')
  get filteredAccounts() {
    // Get IDs for accounts already added to the current user
    const alreadyAddedAccountIDs = this.args.model.account_ids;
    const notAddedAccounts = this.args.accounts.filter(
      ({ id }) => !alreadyAddedAccountIDs.includes(id)
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
