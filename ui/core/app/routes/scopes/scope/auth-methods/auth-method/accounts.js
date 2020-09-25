import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import loading from 'ember-loading/decorator';

export default class ScopesScopeAuthMethodsAuthMethodAccountsRoute extends Route {
  // =services

  @service intl;
  @service notify;

  // =methods

  /**
   * Returns accounts for the current auth method.
   * @return {Promise{[AccountModel]}}
   */
  model() {
    const { id: auth_method_id } = this.modelFor(
      'scopes.scope.auth-methods.auth-method'
    );
    return this.store.query('account', { auth_method_id });
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
  async save(account, password) {
    const { isNew } = account;
    const adapterOptions = {};
    if (isNew) {
      adapterOptions.password = password;
    }
    try {
      await account.save({ adapterOptions });
      await this.transitionTo(
        'scopes.scope.auth-methods.auth-method.accounts.account',
        account
      );
      this.refresh();
      this.notify.success(
        this.intl.t(isNew ? 'notifications.create-success' : 'notifications.save-success')
      );
    } catch (error) {
      // TODO: replace with translated strings
      this.notify.error(error.message, { closeAfter: null });
    }
  }

  /**
   * Delete an account in current scope and redirect to index
   * @param {AccountModel} account
   */
  @action
  @loading
  async delete(account) {
    try {
      await account.destroyRecord();
      await this.transitionTo('scopes.scope.auth-methods.auth-method.accounts');
      this.refresh();
      this.notify.success(this.intl.t('notifications.delete-success'));
    } catch (error) {
      //TODO: replace with translated strings
      this.notify.error(error.message, { closeAfter: null });
    }
  }
}
