import Route from '@ember/routing/route';
import { hash, all } from 'rsvp';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class ScopesScopeProjectsProjectHostCatalogsHostCatalogHostSetsHostSetHostsRoute extends Route {

  // =services

  @service intl;
  @service notify;

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
    const hostSet = this.modelFor('scopes.scope.projects.project.host-catalogs.host-catalog.host-sets.host-set');
    return hash({
      hostSet,
      hosts: all(hostSet.host_ids.map(id =>
        this.store.findRecord('host', id, { adapterOptions: { scopeID } })
      ))
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
      //FIXME: Are adapterOptions needed?
      await hostSet.removeHost(host.id, { adapterOptions : { scopeID, hostCatalogID } });
      this.refresh();
      this.notify.success(this.intl.t('notify.delete-success'));
    } catch (error) {
      // TODO: replace with translated strings
      this.notify.error(error.message, { closeAfter: null });
    }
  }
}
