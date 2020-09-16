import Route from '@ember/routing/route';

export default class ScopesScopeProjectsProjectHostCatalogsNewRoute extends Route {
  // =methods

  /**
   * Creates a new unsaved host catalog belonging to the current project scope.
   * @return {HostCatalogModel}
   */
  model() {
    const scopeModel = this.modelFor('scopes.scope.projects.project');
    return this.store.createRecord('host-catalog', {
      type: 'static',
      scopeModel,
    });
  }
}
