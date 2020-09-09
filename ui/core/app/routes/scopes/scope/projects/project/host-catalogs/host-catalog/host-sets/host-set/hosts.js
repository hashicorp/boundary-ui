import Route from '@ember/routing/route';
import { hash } from 'rsvp';
import { action } from '@ember/object';

export default class ScopesScopeProjectsProjectHostCatalogsHostCatalogHostSetsHostSetHostsRoute extends Route {

  // =methods

  /**
   * Empty out any previously loaded hosts.
   */
  beforeModel() {
    this.store.unloadAll('host');
  }


  /**
   * Loads all hosts under the current host catalog.
   * @return {Promise{[HostModel]}}
   */
  async model() {
    const scopeID = this.modelFor('scopes.scope.projects.project').id;
    const hostCatalogID = this.modelFor('scopes.scope.projects.project.host-catalogs.host-catalog').id;
    const hostSet = this.modelFor('scopes.scope.projects.project.host-catalogs.host-catalog.host-sets.host-set');
    return hash({
      hostSet,
      hosts: this.store.findAll('host', { adapterOptions: { scopeID, hostCatalogID } })
    });
  }

  /**
   * Remove a host from the current hostset and redirect to hosts index.
   * @param {HostModel} host
   */
  @action
  async removeHost(hostSet, host) {
    try {
      const scopeID = this.modelFor('scopes.scope.projects.project').id;
      const hostCatalogID = this.modelFor('scopes.scope.projects.project.host-catalogs.host-catalog').id;
      await hostSet.removeHost(host.id, { adapterOptions : { scopeID, hostCatalogID } });
      this.refresh();
      this.notify.success(this.intl.t('notify.delete-success'));
    } catch (error) {
      // TODO: replace with translated strings
      this.notify.error(error.message, { closeAfter: null });
    }
  }
}
