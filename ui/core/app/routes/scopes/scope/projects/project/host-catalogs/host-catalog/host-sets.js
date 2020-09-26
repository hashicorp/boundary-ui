import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import loading from 'ember-loading/decorator';

export default class ScopesScopeProjectsProjectHostCatalogsHostCatalogHostSetsRoute extends Route {
  // =services

  @service intl;
  @service notify;

  // =methods

  /**
   * Loads all host-sets under the current host catalog and it's parent scope.
   * @return {Promise{[HostSetModel]}}
   */
  model() {
    const { id: host_catalog_id } = this.modelFor(
      'scopes.scope.projects.project.host-catalogs.host-catalog'
    );
    return this.store.query('host-set', { host_catalog_id });
  }

  // =actions

  /**
   * Rollback changes on a host set.
   * @param {HostSetModel} hostSet
   */
  @action
  cancel(hostSet) {
    const { isNew } = hostSet;
    hostSet.rollbackAttributes();
    if (isNew)
      this.transitionTo(
        'scopes.scope.projects.project.host-catalogs.host-catalog.host-sets'
      );
  }

  /**
   * Handle save of a host set.
   * @param {HostSetModel} hostSet
   * @param {Event} e
   */
  @action
  @loading
  async save(hostSet) {
    try {
      const { isNew } = hostSet;
      await hostSet.save();
      await this.transitionTo(
        'scopes.scope.projects.project.host-catalogs.host-catalog.host-sets.host-set',
        hostSet
      );
      await this.refresh();
      this.notify.success(
        this.intl.t(isNew ? 'notifications.create-success' : 'notifications.save-success')
      );
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
  @loading
  async delete(hostSet) {
    try {
      await hostSet.destroyRecord();
      this.notify.success(this.intl.t('notifications.delete-success'));
      this.transitionTo(
        'scopes.scope.projects.project.host-catalogs.host-catalog.host-sets'
      );
    } catch (error) {
      // TODO: replace with translated strings
      this.notify.error(error.message, { closeAfter: null });
    }
  }
}
