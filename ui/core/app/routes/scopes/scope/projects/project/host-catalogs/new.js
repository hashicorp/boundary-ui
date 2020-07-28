import Route from '@ember/routing/route';

export default class ScopesScopeProjectsProjectHostCatalogsNewRoute extends Route {

  // =methods

  /**
   * Creates a new unsaved host catalog belonging to the current project scope.
   * @return {HostCatalogModel}
   */
  model() {
    const scopeID = this.modelFor('scopes.scope.projects.project').id;
    return this.store.createRecord('host-catalog', { scopeID });
  }

}
