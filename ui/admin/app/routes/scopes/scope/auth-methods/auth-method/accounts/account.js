import Route from '@ember/routing/route';

export default class ScopesScopeAuthMethodsAuthMethodAccountsAccountRoute extends Route {
  // =methods

  /**
   * Load an account by ID.
   * @param {object} params
   * @param {string} params.account_id
   * @return {AccountModel}
   */
  model({ account_id }) {
    return this.store.findRecord('account', account_id, { reload: true });
  }
}
