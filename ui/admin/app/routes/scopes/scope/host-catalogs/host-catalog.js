import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ScopesScopeHostCatalogsHostCatalogRoute extends Route {
  // =services

  @service store;

  // =methods

  /**
   * Load a host catalog.
   * @param {object} params
   * @param {string} params.host_catalog_id
   * @return {HostCatalogModel}
   */
  async model({ host_catalog_id }) {
    return this.store.findRecord('host-catalog', host_catalog_id);
  }
}
