import Route from '@ember/routing/route';

export default class OrgsOrgProjectsProjectHostCatalogsHostCatalogRoute extends Route {

  // =methods

  /**
   * Returns a host catalog by id.
   * @param {object} params
   * @return {Promise{HostCatalogModel}}
   */
  model({ host_catalog_id: id }) {
    return this.store.findRecord('host-catalog', id);
  }

}
