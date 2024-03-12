import Controller, { inject as controller } from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { loading } from 'ember-loading';
import { confirm } from 'core/decorators/confirm';
import { notifySuccess, notifyError } from 'core/decorators/notify';

export default class ScopesScopeAuthMethodsAuthMethodAccountsIndexController extends Controller {
  @controller('scopes/scope/auth-methods/index') authMethods;

  // =services

  @service can;
  @service router;

  // =actions

  /**
   * Rollback changes on an account.
   * @param {AccountModel} account
   */
  @action
  async cancel(account) {
    const { isNew } = account;
    account.rollbackAttributes();
    if (isNew) {
      await this.router.transitionTo(
        'scopes.scope.auth-methods.auth-method.accounts',
      );
    }
  }

  /**
   * Save an account in current scope.
   * @param {AccountModel} account
   */
  @action
  @loading
  @notifyError(({ message }) => message)
  @notifySuccess(({ isNew }) =>
    isNew ? 'notifications.create-success' : 'notifications.save-success',
  )
  async save(account, password) {
    const { isNew } = account;
    const adapterOptions = {};
    if (isNew) {
      adapterOptions.password = password;
    }
    await account.save({ adapterOptions });
    if (this.can.can('read model', account)) {
      await this.router.transitionTo(
        'scopes.scope.auth-methods.auth-method.accounts.account',
        account,
      );
    } else {
      await this.router.transitionTo(
        'scopes.scope.auth-methods.auth-method.accounts',
      );
    }
    await this.router.refresh();
  }

  /**
   * Delete an account in current scope and redirect to index
   * @param {AccountModel} account
   */
  @action
  @loading
  @confirm('questions.delete-confirm')
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('notifications.delete-success')
  async delete(account) {
    await account.destroyRecord();
    await this.router.replaceWith(
      'scopes.scope.auth-methods.auth-method.accounts',
    );
    await this.router.refresh();
  }
}
