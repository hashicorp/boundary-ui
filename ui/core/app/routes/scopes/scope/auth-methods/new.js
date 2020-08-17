import Route from '@ember/routing/route';

export default class ScopesScopeAuthMethodsNewRoute extends Route {
  // =methods

  /**
   * Create a new unsaved auth-method.
   * @return {AuthMethodModel}
   */
  model() {
    const scopeModel = this.modelFor('scopes.scope');
    return this.store.createRecord('auth-method', { type: 'password', scopeModel });
  }
}
