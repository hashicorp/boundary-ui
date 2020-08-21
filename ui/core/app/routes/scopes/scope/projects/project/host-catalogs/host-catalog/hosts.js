import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class ScopesScopeProjectsProjectHostCatalogsHostCatalogHostsRoute extends Route {
  // =services

  @service intl;
  @service notify;

  // =methods

  /**
   * Loads all hosts under the current host catalog and it's parent project scope.
   * @return {Promise{[HostModel]}}
   */
  async model() {
    return this.store.findAll('host', this.adapterOptions());
  }

  // =actions

  /**
   * Rollback changes on a host.
   * @param {HostModel} host
   */
  @action
  cancel(host) {
    const { isNew } = host;
    host.rollbackAttributes();
    if (isNew) this.transitionTo('scopes.scope.projects.project.host-catalogs.host-catalog.hosts');
  }

  /**
   * Handle save of a host.
   * @param {HostModel} host
   * @param {Event} e
   */
  @action
  async save(host) {
    try {
      const { isNew } = host;
      await host.save(this.adapterOptions());
      this.refresh();
      this.notify.success(
        this.intl.t(isNew ? 'notify.create-success' : 'notify.save-success')
      );
      this.transitionTo('scopes.scope.projects.project.host-catalogs.host-catalog.hosts.host', host);
    } catch (error) {
      // TODO: replace with translated strings
      this.notify.error(error.message, { closeAfter: null });
    }
  }

  /**
   * Delete host in current scope and redirect to index.
   * @param {HostModel} host
   */
  @action
  async delete(host) {
    try {
      await host.destroyRecord(this.adapterOptions());
      this.refresh();
      this.notify.success(this.intl.t('notify.delete-success'));
      this.transitionTo('scopes.scope.projects.project.host-catalogs.host-catalog.hosts');
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
