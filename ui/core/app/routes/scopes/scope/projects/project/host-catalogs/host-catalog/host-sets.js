import Route from '@ember/routing/route';

export default class ScopesScopeProjectsProjectHostCatalogsHostCatalogHostSetsRoute extends Route {
  /**
   * Loads all host-sets under the current scope and host catalog.
   * @return {Promise{[HostSetModel]}}
   */
  async model() {
    const scopeID = this.modelFor('scopes.scope.projects.project').id;
    const hostCatalogID = this.modelFor('scopes.scope.projects.project.host-catalogs.host-catalog').id;
    return this.store.findAll('host-set', { adapterOptions: { scopeID, hostCatalogID } });
  }
}
