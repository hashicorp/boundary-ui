import Route from '@ember/routing/route';

export default class ScopesScopeAuthMethodsNewRoute extends Route {
  // =attributes

  queryParams = {
    type: {
      refreshModel: true,
    },
  };

  // =methods

  /**
   * Create a new unsaved auth-method.
   * @return {AuthMethodModel}
   */
  model(params) {
    const scopeModel = this.modelFor('scopes.scope');
    return this.store.createRecord('auth-method', {
      scopeModel,
      type: params.type,
    });
  }
}
