import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { loading } from 'ember-loading';
import { confirm } from 'core/decorators/confirm';
import { notifySuccess, notifyError } from 'core/decorators/notify';

export default class ScopesScopeHostCatalogsHostCatalogHostSetsRoute extends Route {
  // =services

  @service intl;
  @service notify;
  @service can;
  @service router;

  // =methods

  /**
   * Loads all host-sets under the current host catalog and it's parent scope.
   * @return {Promise{[HostSetModel]}}
   */
  model() {
    const hostCatalog = this.modelFor(
      'scopes.scope.host-catalogs.host-catalog'
    );

    const { id: host_catalog_id } = hostCatalog;
    if (
      this.can.can('list model', hostCatalog, {
        collection: 'host-sets',
      })
    ) {
      return this.store.query('host-set', { host_catalog_id });
    }
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
      this.router.transitionTo(
        'scopes.scope.host-catalogs.host-catalog.host-sets'
      );
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
    if (this.can.can('read model', hostSet)) {
      await this.router.transitionTo(
        'scopes.scope.host-catalogs.host-catalog.host-sets.host-set',
        hostSet
      );
    } else {
      await this.router.transitionTo(
        'scopes.scope.host-catalogs.host-catalog.host-sets'
      );
    }
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
    await this.router.replaceWith(
      'scopes.scope.host-catalogs.host-catalog.host-sets'
    );
  }

  // /**
  //  * Adds a string item to array `property` on the passed `filter`.

  //  * @param {hostSetModel} hostSet
  //  * @param {string} property
  //  * @param {string} value
  //  */
  //  @action
  //  async addStringItem(hostSet, property, value) {
  //    const array = hostSet.get(property);
  //    array.addObject({ value });
  //  }
  //  /**
  //   * Removes an item from array `property` at `index` on the
  //   * passed `hostSet`.
  //   * @param {hostSetModel} hostSet
  //   * @param {string} property
  //   * @param {number} index
  //   */
  //  @action
  //  async removeItemByIndex(hostSet, property, index) {
  //    const array = hostSet.get(property);
  //    array.removeAt(index);
  //  }
}
