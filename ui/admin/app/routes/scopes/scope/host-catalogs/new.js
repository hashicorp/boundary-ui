import Route from '@ember/routing/route';

export default class ScopesScopeHostCatalogsNewRoute extends Route {
  // =methods

  /**
   * Creates a new unsaved host catalog belonging to the current scope.
   * @return {HostCatalogModel}
   */
  model() {
    const scopeModel = this.modelFor('scopes.scope');
    return this.store.createRecord('host-catalog', {
      type: 'static',
      scopeModel,
    });
  }
}
