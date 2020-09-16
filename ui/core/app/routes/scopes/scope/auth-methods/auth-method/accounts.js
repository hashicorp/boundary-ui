import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

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
    const { id: auth_method_id } =
      this.modelFor('scopes.scope.auth-methods.auth-method');
    return this.store.query('account', { auth_method_id });
  }

  // =actions

  /**
   * Rollback changes on an account.
   * @param {AccountModel} account
   */
  @action
  cancel(account) {
    account.rollbackAttributes();
  }

  /**
   * Save an account in current scope.
   * @param {AccountModel} account
   */
  @action
  async save(account) {
    try {
      await account.save();
      await this.refresh();
      await this.transitionTo('scopes.scope.auth-methods.auth-method.accounts.account', account);
      this.notify.success(
        this.intl.t('notify.save-success')
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
  async delete(account) {
    try {
      await account.destroyRecord();
      await this.transitionTo('scopes.scope.auth-methods.auth-method.accounts');
      this.refresh();
      this.notify.success(this.intl.t('notify.delete-success'));
    } catch (error) {
      //TODO: replace with translated strings
      this.notify.error(error.message, { closeAfter: null });
    }
  }
}
