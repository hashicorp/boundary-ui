import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { hash, all } from 'rsvp';
import loading from 'ember-loading/decorator';

export default class ScopesScopeUsersUserAccountsRoute extends Route {
  // =services

  @service intl;
  @service notify;

  // =methods

  /**
   * Returns users associated with this user.
   * @return {Promise{user: UserModel, accounts: Promise{[AccountModel]}}}
   */
  model() {
    const { id: scopeID } = this.modelFor('scopes.scope');
    const user = this.modelFor('scopes.scope.users.user');
    return hash({
      user,
      accounts: all(
        user.account_ids.map((id) =>
          this.store.findRecord('account', id, { adapterOptions: { scopeID } })
        )
      ),
    });
  }

  // =actions

  /**
   * Remove a account from the current role and redirect to accounts index.
   * @param {UserModel} user
   * @param {AccountModel} account
   */
  @action
  @loading
  async removeAccount(user, account) {
    try {
      await user.removeAccount(account.id);
      await this.refresh();
      this.notify.success(this.intl.t('notifications.remove-success'));
    } catch (error) {
      // TODO: replace with translated strings
      this.notify.error(error.message, { closeAfter: null });
    }
  }
}
