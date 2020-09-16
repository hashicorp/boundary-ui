import Route from '@ember/routing/route';

export default class ScopesScopeAuthMethodsAuthMethodAccountsRoute extends Route {

  // =methods

  /**
   * Returns accounts in current auth method.
   * @return {Promise{[AccountModel]}}
   */
  model() {
    const { id: auth_method_id } = this.modelFor('scopes.scope.auth-methods.auth-method');
    return this.store.query('account', { auth_method_id });
  }
}
