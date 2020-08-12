import Route from '@ember/routing/route';

export default class ScopesScopeAuthMethodsAuthMethodRoute extends Route {
  // =methods

  /**
   * Load a single auth-method in current scope.
   * @param {object} params
   * @param {string} params.auth_method_id
   * @return {authMethodModel}
   */
  async model({ auth_method_id}) {
    const { id: scopeID } = this.modelFor('scopes.scope');
    return this.store.findRecord('auth-method', auth_method_id, { adapterOptions: { scopeID }});
  }
}
