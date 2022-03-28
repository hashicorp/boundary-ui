import Route from '@ember/routing/route';

export default class ScopesScopeTargetsNewRoute extends Route {
  // =methods

  // =attributes
  queryParams = {
    type: {
      refreshModel: true,
    },
  };
  /**
   * Creates a new unsaved target in current scope.
   * @return {TargetModel}
   */

  model(params) {
    const scopeModel = this.modelFor('scopes.scope');
    if (!params.type) {
      params.type = 'tcp'; //tcp is the default type
    }
    return this.store.createRecord('target', {
      type: params.type,
      scopeModel,
    });
  }
}
