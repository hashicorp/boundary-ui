import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class ScopesScopeProjectsProjectHostCatalogsHostCatalogHostSetsRoute extends Route {
  // =services

  @service intl;
  @service notify;

  // =methods

  /**
   * Loads all host-sets under the current host catalog and it's parent scope.
   * @return {Promise{[HostSetModel]}}
   */
  async model() {
    const scopeID = this.modelFor('scopes.scope.projects.project').id;
    const hostCatalogID = this.modelFor('scopes.scope.projects.project.host-catalogs.host-catalog').id;
    return this.store.findAll('host-set', { adapterOptions: { scopeID, hostCatalogID } });
  }

  // =actions

  /**
   * Rollback changes on a host set.
   * @param {HostSetModel} hostSet
   */
  @action
  cancel(hostSet) {
    hostSet.rollbackAttributes();
  }

  /**
   * Handle save of a host set.
   * @param {HostSetModel} hostSet
   * @param {Event} e
   */
  @action
  async save(hostSet) {
    try {
      await hostSet.save(this.adapterOptions());
      this.refresh();
      this.notify.success(this.intl.t('notify.save-success'));
      this.transitionTo('scopes.scope.projects.project.host-catalogs.host-catalog.host-sets.host-set', hostSet);
    } catch (error) {
      // TODO: replace with translated strings
      this.notify.error(error.message, { closeAfter: null });
    }
  }

  /**
   * Delete host set in current scope and redirect to index.
   * @param {HostSetModel} hostSet
   */
  @action
  async delete(hostSet) {
    try {
      await hostSet.destroyRecord(this.adapterOptions());
      this.refresh();
      this.notify.success(this.intl.t('notify.delete-success'));
      this.transitionTo('scopes.scope.projects.project.host-catalogs.host-catalog.host-sets');
    } catch (error) {
      // TODO: replace with translated strings
      this.notify.error(error.message, { closeAfter: null });
    }
  }

  /**
   * Configure adapter options using current host catalog scope and it's parent project scope.
   * @return {object}
   */
  adapterOptions() {
    const scopeID = this.modelFor('scopes.scope.projects.project').id;
    const hostCatalogID = this.modelFor('scopes.scope.projects.project.host-catalogs.host-catalog').id;
    return { adapterOptions : { scopeID, hostCatalogID } };
  }
}
