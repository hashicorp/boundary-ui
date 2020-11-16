import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import loading from 'ember-loading/decorator';
import { confirm } from '../../../../../decorators/confirm';
import { notifySuccess, notifyError } from '../../../../../decorators/notify';

export default class ScopesScopeHostCatalogsHostCatalogHostsRoute extends Route {
  // =services

  @service intl;
  @service notify;

  // =methods

  /**
   * Loads all hosts under the current host catalog and it's parent scope.
   * @return {Promise{[HostModel]}}
   */
  model() {
    const { id: host_catalog_id } = this.modelFor(
      'scopes.scope.host-catalogs.host-catalog'
    );
    return this.store.query('host', { host_catalog_id });
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
