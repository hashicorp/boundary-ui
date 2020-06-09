import Route from '@ember/routing/route';

export default class OrgsOrgProjectsProjectHostCatalogsRoute extends Route {

  // =methods

  /**
   * Returns host catalogs for the current scope.
   * @return {Promise[HostCatalogModel]}
   */
  model() {
    return this.store.findAll('host-catalog');
  }
}
