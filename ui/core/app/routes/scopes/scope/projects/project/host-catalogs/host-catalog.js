import Route from '@ember/routing/route';

export default class ScopesScopeProjectsProjectHostCatalogsHostCatalogRoute extends Route {

  // =methods

  /**
   * Load a host catalog.
   * @param {object} params
   * @param {string} params.host_catalog_id
   * @return {HostCatalogModel}
   */
  async model({ host_catalog_id }) {
    const { id: scopeID } = this.modelFor('scopes.scope');
    this.store.findAll('host-set', {
      adapterOptions: {
        scopeID,
        hostCatalogID: host_catalog_id
      }
    })
    return this.store.findRecord('host-catalog', host_catalog_id, {
      adapterOptions: { scopeID },
    });
  }

}
