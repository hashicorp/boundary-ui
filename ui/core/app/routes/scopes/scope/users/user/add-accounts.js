import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { all } from 'rsvp';
import loading from 'ember-loading/decorator';

export default class ScopesScopeUsersUserAddAccountsRoute extends Route {
  // =services

  @service intl;
  @service notify;

  // =methods

  /**
   * Emtpy out any previously loaded acconuts.
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

  /**
   * Renders the route-set specific page sections
   * @override
   */
  renderTemplate() {
    super.renderTemplate(...arguments);

    this.render('scopes/scope/users/user/add-accounts/-header', {
      into: 'scopes/scope/users/user',
      outlet: 'header',
    });

    this.render('-empty', {
      into: 'scopes/scope/users/user',
      outlet: 'actions',
    });

    this.render('-empty', {
      into: 'scopes/scope/users/user',
      outlet: 'navigation',
    });
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
  async addAccounts(user, accountIDs) {
    try {
      await user.addAccounts(accountIDs);
      await this.replaceWith('scopes.scope.users.user.accounts');
      this.notify.success(this.intl.t('notifications.add-success'));
    } catch (error) {
      // TODO: replace with translated strings
      this.notify.error(error.message, { closeAfter: null });
    }
  }

  /**
   * Redirect to user accounts as if nothing ever happened.
   */
  @action
  cancel() {
    this.replaceWith('scopes.scope.users.user.accounts');
  }
}
