import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class ScopesScopeProjectsProjectHostCatalogsRoute extends Route {

  // =services

  @service notify;

  // =methods


  /**
   * Loads all scopes under the current scope.
   * @return {Promise{[HostCatalogModel]}}
   */
  async model() {
    const scopeID = this.modelFor('scopes.scope.projects.project').id;
    return this.store.findAll('host-catalog', { adapterOptions: { scopeID } });
  }

  // =actions

  /**
   * Rollback changes on project.
   * @param {HostCatalogModel} hostCatalog
   */
  @action
  cancel(hostCatalog) {
    const { isNew } = hostCatalog;
    hostCatalog.rollbackAttributes();
    if (isNew) this.transitionTo('scopes.scope.projects.project.host-catalogs');
  }

  /**
   * Handle save.
   * @param {HostCatalogModel} hostCatalog
   * @param {Event} e
   */
  @action
  async save(hostCatalog) {
    try {
      await hostCatalog.save();
      this.refresh();
      // TODO: replace with translated strings
      this.notify.success('Save succeeded.');
      this.transitionTo('scopes.scope.projects.project.host-catalogs.host-catalog', hostCatalog);
    } catch (error) {
      // TODO: replace with translated strings
      this.notify.error(error.message, { closeAfter: null });
    }
  }

  /**
   * Deletes the host catalog and redirects to index.
   * @param {ProjectModel} project
   */
  @action
  async delete(project) {
    try {
      await project.destroyRecord();
      this.refresh();
      this.transitionTo('scopes.scope.projects.project.host-catalogs');
      // TODO: replace with translated strings
      this.notify.success('Deleted host catalog succesfully.');
    } catch (error) {
      // TODO: replace with translated strings
      this.notify.error(error.message, { closeAfter: null });
    }
  }

}
