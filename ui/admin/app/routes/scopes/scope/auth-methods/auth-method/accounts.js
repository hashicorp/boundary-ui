import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import loading from 'ember-loading/decorator';
import { confirm } from 'core/decorators/confirm';
import { notifySuccess, notifyError } from 'core/decorators/notify';

export default class ScopesScopeAuthMethodsAuthMethodAccountsRoute extends Route {
  // =services

  @service intl;
  @service notify;
  @service can;
  // =methods

  /**
   * Returns accounts for the current auth method.
   * @return {Promise{[AccountModel]}}
   */
  model() {
    const authMethod = this.modelFor('scopes.scope.auth-methods.auth-method');
    const { id: auth_method_id } = authMethod;
    if (
      this.can.can('list collection', authMethod, {
        collection: 'accounts',
      })
    ) {
      return this.store.query('account', { auth_method_id });
    }
  }

  // =actions

  /**
   * Rollback changes on an account.
   * @param {AccountModel} account
   */
  @action
  cancel(account) {
    const { isNew } = account;
    account.rollbackAttributes();
    if (isNew)
      this.transitionTo('scopes.scope.auth-methods.auth-method.accounts');
  }

  /**
   * Save an account in current scope.
   * @param {AccountModel} account
   */
  @action
  @loading
  @notifyError(({ message }) => message)
  @notifySuccess(({ isNew }) =>
    isNew ? 'notifications.create-success' : 'notifications.save-success'
  )
  async save(account, password) {
    const { isNew } = account;
    const adapterOptions = {};
    if (isNew) {
      adapterOptions.password = password;
    }
    await account.save({ adapterOptions });
    await this.transitionTo(
      'scopes.scope.auth-methods.auth-method.accounts.account',
      account
    );
    this.refresh();
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
  async deleteAccount(account) {
    await account.destroyRecord();
    await this.replaceWith('scopes.scope.auth-methods.auth-method.accounts');
    this.refresh();
  }
}
