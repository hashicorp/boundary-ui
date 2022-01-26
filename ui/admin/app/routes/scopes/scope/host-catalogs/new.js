import Route from '@ember/routing/route';

export default class ScopesScopeHostCatalogsNewRoute extends Route {
  // =attributes

  queryParams = {
    type: {
      refreshModel: true,
    },
  };

  // =methods

  /**
   * Creates a new unsaved host catalog belonging to the current scope.
   * @return {HostCatalogModel}
   */
  model(params) {
    const scopeModel = this.modelFor('scopes.scope');
    // TODO Use model provider type method
    //  to set params.type to 'static' if type is not provided
    params.type = 'static';
    return this.store.createRecord('host-catalog', {
      type: params.type,
      scopeModel,
    });
  }
}
