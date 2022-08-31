import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { hash, all } from 'rsvp';
import { loading } from 'ember-loading';
import { notifySuccess, notifyError } from 'core/decorators/notify';

export default class ScopesScopeUsersUserAccountsRoute extends Route {
  // =services

  @service intl;

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
   * Remove an account from the current role and redirect to accounts index.
   * @param {UserModel} user
   * @param {AccountModel} account
   */
  @action
  @loading
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('notifications.remove-success')
  async removeAccount(user, account) {
    await user.removeAccount(account.id);
    await this.refresh();
  }
}
