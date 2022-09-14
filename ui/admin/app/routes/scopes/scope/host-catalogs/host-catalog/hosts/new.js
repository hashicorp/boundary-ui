import Route from '@ember/routing/route';

export default class ScopesScopeHostCatalogsHostCatalogHostsNewRoute extends Route {
  // =methods

  /**
   * Creates a new unsaved host in current host catalog scope.
   * @return {HostModel}
   */
  model() {
    const { id: host_catalog_id } = this.modelFor(
      'scopes.scope.host-catalogs.host-catalog'
    );
    return this.store.createRecord('host', {
      type: 'static',
      host_catalog_id,
    });
  }
}
