import Route from '@ember/routing/route';

export default class ScopesScopeAuthMethodsAuthMethodAccountsNewRoute extends Route {
  // =methods

  /**
   * Creates a new unsaved account in current scope.
   * @return {AccountModel}
   */
  model() {
    const { id: auth_method_id, type } = this.modelFor(
      'scopes.scope.auth-methods.auth-method'
    );
    return this.store.createRecord('account', {
      type,
      auth_method_id,
    });
  }
}
