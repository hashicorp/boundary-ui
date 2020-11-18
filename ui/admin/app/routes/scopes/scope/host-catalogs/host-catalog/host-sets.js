import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import loading from 'ember-loading/decorator';
import { confirm } from 'core/decorators/confirm';
import { notifySuccess, notifyError } from '../../../../../decorators/notify';

export default class ScopesScopeHostCatalogsHostCatalogHostSetsRoute extends Route {
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
      'scopes.scope.host-catalogs.host-catalog'
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
      this.transitionTo('scopes.scope.host-catalogs.host-catalog.host-sets');
  }

  /**
   * Handle save of a host set.
   * @param {HostSetModel} hostSet
   * @param {Event} e
   */
  @action
  @loading
  @notifyError(({ message }) => message)
  @notifySuccess(({ isNew }) =>
    isNew ? 'notifications.create-success' : 'notifications.save-success'
  )
  async save(hostSet) {
    await hostSet.save();
    await this.transitionTo(
      'scopes.scope.host-catalogs.host-catalog.host-sets.host-set',
      hostSet
    );
    this.refresh();
  }

  /**
   * Delete host set in current scope and redirect to index.
   * @param {HostSetModel} hostSet
   */
  @action
  @loading
  @confirm('questions.delete-confirm')
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('notifications.delete-success')
  async deleteHostSet(hostSet) {
    await hostSet.destroyRecord();
    await this.replaceWith('scopes.scope.host-catalogs.host-catalog.host-sets');
  }
}
