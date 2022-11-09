import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ScopesScopeHostCatalogsHostCatalogHostsHostRoute extends Route {
  // =services

  @service store;

  // =methods

  /**
   * Load a host using current host-catalog and it's parent scope.
   * @param {object} params
   * @param {string} params.host_id
   * @return {HostModel}
   */
  async model({ host_id }) {
    return this.store.findRecord('host', host_id, { reload: true });
  }
}
