import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import loading from 'ember-loading/decorator';
import { confirm } from 'core/decorators/confirm';
import { notifySuccess, notifyError } from 'core/decorators/notify';

export default class ScopesScopeHostCatalogsHostCatalogHostsRoute extends Route {
  // =services

  @service intl;
  @service notify;
  @service can;
  // =methods

  /**
   * Loads all hosts under the current host catalog and it's parent scope.
   * @return {Promise{[HostModel]}}
   */
  model() {
    const hostCatalog = this.modelFor(
      'scopes.scope.host-catalogs.host-catalog'
    );
    const { id: host_catalog_id } = hostCatalog;
    if (
      this.can.can('list collection', hostCatalog, {
        collection: 'hosts',
      })
    ) {
      return this.store.query('host', { host_catalog_id });
    }
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
    if (isNew)
      this.transitionTo('scopes.scope.host-catalogs.host-catalog.hosts');
  }

  /**
   * Handle save of a host.
   * @param {HostModel} host
   * @param {Event} e
   */
  @action
  @loading
  @notifyError(({ message }) => message)
  @notifySuccess(({ isNew }) =>
    isNew ? 'notifications.create-success' : 'notifications.save-success'
  )
  async save(host) {
    await host.save();
    await this.transitionTo(
      'scopes.scope.host-catalogs.host-catalog.hosts.host',
      host
    );
    this.refresh();
  }

  /**
   * Delete host in current scope and redirect to index.
   * @param {HostModel} host
   */
  @action
  @loading
  @confirm('questions.delete-confirm')
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('notifications.delete-success')
  async deleteHost(host) {
    await host.destroyRecord();
    await this.replaceWith('scopes.scope.host-catalogs.host-catalog.hosts');
    this.refresh();
  }
}
