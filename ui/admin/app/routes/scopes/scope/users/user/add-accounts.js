import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { all } from 'rsvp';
import { loading } from 'ember-loading';
import { notifySuccess, notifyError } from 'core/decorators/notify';

export default class ScopesScopeUsersUserAddAccountsRoute extends Route {
  // =services

  @service store;
  @service intl;
  @service router;

  // =methods

  /**
   * Empty out any previously loaded accounts.
   */
  beforeModel() {
    this.store.unloadAll('account');
  }

  /**
   * Returns the current target, all host catalogs, and all host sets.
   * @return {{target: TargetModel, hostCatalogs: [HostCatalogModel], hostSets: [HostSetModel]}}
   */
  async model() {
    const user = this.modelFor('scopes.scope.users.user');
    const { id: scope_id } = this.modelFor('scopes.scope');
    const authMethods = await this.store.query('auth-method', { scope_id });
    await all(
      authMethods.map(({ id: auth_method_id }) =>
        this.store.query('account', { auth_method_id })
      )
    );
    const accounts = this.store.peekAll('account');
    return { user, authMethods, accounts };
  }

  // =actions

  /**
   * Adds accounts to the user and saves, replaces with the accounts index
   * route, and notifies the user of success or error.
   * @param {UserModel} user
   * @param {[string]} accountIDs
   */
  @action
  @loading
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('notifications.add-success')
  async addAccounts(user, accountIDs) {
    await user.addAccounts(accountIDs);
    await this.router.replaceWith('scopes.scope.users.user.accounts');
  }

  /**
   * Redirect to user accounts as if nothing ever happened.
   */
  @action
  cancel() {
    this.router.replaceWith('scopes.scope.users.user.accounts');
  }
}
