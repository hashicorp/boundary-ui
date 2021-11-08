import Route from '@ember/routing/route';

export default class ScopesScopeAuthMethodsAuthMethodManagedGroupsRoute extends Route {
  /**
   *
   * @returns {Promise{[ManagedGroupsModel]}}
   */
  model() {
    const authMethod = this.modelFor('scopes.scope.auth-methods.auth-method');
    const { id: auth_method_id } = authMethod;
    return this.store.query('managed-group', { auth_method_id });
  }
}
