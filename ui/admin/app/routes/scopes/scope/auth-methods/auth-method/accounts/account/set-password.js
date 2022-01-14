import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { loading } from 'ember-loading';
import { notifySuccess, notifyError } from 'core/decorators/notify';

export default class ScopesScopeAuthMethodsAuthMethodAccountsAccountSettingsRoute extends Route {
  // =services

  @service intl;
  @service notify;
  @service router;

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
    await this.router.replaceWith(
      'scopes.scope.auth-methods.auth-method.accounts.account.set-password'
    );
  }
}
