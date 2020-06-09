import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class OrgsOrgProjectsProjectHostCatalogsNewRoute extends Route {
  // =services

  @service notify;

  // =methods

  /**
   * Returns a new unsaved host catalog.
   * @return {Promise{HostCatalogModel}}
   */
  model() {
    return this.store.createRecord('hostCatalog');
  }

  // =actions

  /**
   * Rollback changes on host catalog (which destroys unsaved instances)
   * and redirects to host catalogs index.
   * @param {HostCatalogModel} hostCatalog
   */
  @action
  cancel(hostCatalog) {
    hostCatalog.rollbackAttributes();
    this.transitionTo('orgs.org.projects.project.host-catalogs');
  }

  /**
   * Handle save host catalog.
   * @param {HostCatalogModel} hostCatalog
   * @param {Event} e
   */
  @action
  async save(hostCatalog) {
    try {
      await hostCatalog.save();
      this.transitionTo('orgs.org.projects.project.host-catalogs.host-catalog', hostCatalog);
      // TODO: replace with translated strings
      this.notify.success('Host catalog created.');
    } catch (error) {
      // TODO: replace with translated strings
      this.notify.error(error.message, { closeAfter: null });
    }
  }
}
