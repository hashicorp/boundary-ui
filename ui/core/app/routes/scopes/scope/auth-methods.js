import Route from '@ember/routing/route';

export default class ScopesScopeAuthMethodsRoute extends Route {
  // =methods

  /**
   * Load all auth-methods under current scope
   * @return {Promise[AuthMethodModel]}
   */
  async model() {
    const { id: scopeID} = this.modelFor('scopes.scope');
    return this.store.findAll('auth-method', { adapterOptions: { scopeID } });
  }
}
