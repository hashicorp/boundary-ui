import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class OrgsOrgProjectsProjectHostCatalogsHostCatalogRoute extends Route {

  // =services

  @service notify;

  // =methods

  /**
   * Returns a host catalog by id.
   * @param {object} params
   * @return {Promise{HostCatalogModel}}
   */
  model({ host_catalog_id: id }) {
    return this.store.findRecord('host-catalog', id);
  }

  // =actions

  /**
   * Rollback changes on host catalog.
   * @param {HostCatalogModel} hostCatalog
   */
  @action
  cancel(hostCatalog) {
    hostCatalog.rollbackAttributes();
  }

  /**
   * Handle save host catalog.
   * @param {HostCatalogModel} host catalog
   * @param {Event} e
   */
  @action
  async save(hostCatalog) {
    try {
      await hostCatalog.save();
      // TODO: replace with translated strings
      this.notify.success('Save succeeded.');
    } catch (error) {
      // TODO: replace with translated strings
      this.notify.error(error.message, { closeAfter: null });
    }
  }

  /**
   * Deletes the host catalog and redirects to index.
   * @param {HostCatalogModel} hostCatalog
   */
  @action
  async delete(hostCatalog) {
    try {
      await hostCatalog.destroyRecord();
      this.transitionTo('orgs.org.projects.project.host-catalogs');
      // TODO: replace with translated strings
      this.notify.success('Deleted host catalog succesfully.');
    } catch (error) {
      // TODO: replace with translated strings
      this.notify.error(error.message, { closeAfter: null });
    }
  }

}
