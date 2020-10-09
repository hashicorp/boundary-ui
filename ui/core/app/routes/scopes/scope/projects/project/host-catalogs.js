import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import loading from 'ember-loading/decorator';
import { confirm } from '../../../../../decorators/confirm';
import { notifySuccess, notifyError } from '../../../../../decorators/notify';

export default class ScopesScopeProjectsProjectHostCatalogsRoute extends Route {
  // =services

  @service intl;
  @service notify;

  // =methods

  /**
   * Loads all host catalogs under the current scope.
   * @return {Promise{[HostCatalogModel]}}
   */
  async model() {
    const { id: scope_id } = this.modelFor('scopes.scope.projects.project');
    return this.store.query('host-catalog', { scope_id });
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
  @loading
  @notifyError(({ message }) => message)
  @notifySuccess(({ isNew }) => isNew ? 'notifications.create-success' : 'notifications.save-success')
  async save(hostCatalog) {
    await hostCatalog.save();
    await this.transitionTo(
      'scopes.scope.projects.project.host-catalogs.host-catalog',
      hostCatalog
    );
    this.refresh();
  }

  /**
   * Deletes the host catalog and redirects to index.
   * @param {HostCatalogModel} hostCatalog
   */
  @action
  @loading
  @confirm('questions.delete-confirm')
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('notifications.delete-success')
  async delete(hostCatalog) {
    await hostCatalog.destroyRecord();
    await this.replaceWith('scopes.scope.projects.project.host-catalogs');
    this.refresh();
  }
}
