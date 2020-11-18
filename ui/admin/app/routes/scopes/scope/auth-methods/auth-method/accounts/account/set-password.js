import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import loading from 'ember-loading/decorator';
import {
  notifySuccess,
  notifyError,
} from 'core/decorators/notify';

export default class ScopesScopeAuthMethodsAuthMethodAccountsAccountSettingsRoute extends Route {
  // =services

  @service intl;
  @service notify;

  // =methods

  /**
   * Renders the route-set specific page sections
   * @override
   */
  renderTemplate() {
    super.renderTemplate(...arguments);
    this.render(
      'scopes/scope/auth-methods/auth-method/accounts/account/set-password/-header',
      {
        into: 'scopes/scope/auth-methods/auth-method',
        outlet: 'header',
      }
    );
  }

  // =actions

  /**
   * Set password for the specified account.
   * @param {AccountModel} account
   * @param {string} password
   */
  @action
  @loading
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('notifications.save-success')
  async setPassword(account, password) {
    await account.setPassword(password);
    await this.replaceWith(
      'scopes.scope.auth-methods.auth-method.accounts.account.set-password'
    );
  }
}
