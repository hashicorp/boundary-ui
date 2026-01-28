/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller, { inject as controller } from '@ember/controller';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { loading } from 'ember-loading';
import { confirm } from 'core/decorators/confirm';
import { notifySuccess, notifyError } from 'core/decorators/notify';

export default class ScopesScopeHostCatalogsHostCatalogHostSetsIndexController extends Controller {
  @controller('scopes/scope/host-catalogs/index') hostCatalogs;

  // =services

  @service can;
  @service intl;
  @service router;
  @service store;

  // =attributes

  /**
   * If can list (at least): return default welcome message.
   * If can create (only): return create-but-not-list welcome message.
   * If can neither list nor create: return neither-list-nor-create welcome message
   * @type {string}
   */
  get messageDescription() {
    const canList = this.can.can('list model', this.hostCatalog, {
      collection: 'host-sets',
    });
    const canCreate = this.can.can('create model', this.hostCatalog, {
      collection: 'host-sets',
    });
    const resource = this.intl.t('resources.host-set.title_plural');
    let description = 'descriptions.neither-list-nor-create';

    if (canList) {
      description = 'resources.host-set.description';
    } else if (canCreate) {
      description = 'descriptions.create-but-not-list';
    }

    return this.intl.t(description, { resource });
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
    if (isNew) {
      this.router.transitionTo(
        'scopes.scope.host-catalogs.host-catalog.host-sets',
      );
    }
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
    isNew ? 'notifications.create-success' : 'notifications.save-success',
  )
  async save(hostSet) {
    // Fetch newest host set as updates to host set attributes cause an async db update which
    // updates the version again and can cause a version mismatch if the host set is updated
    // again and we haven't fetched the newest version.
    if (this.can.can('read host-set', hostSet)) {
      const newestHostSet = await this.store.findRecord(
        'host-set',
        hostSet.id,
        {
          reload: true,
        },
      );

      hostSet.version = newestHostSet.version;
    }

    await hostSet.save();

    if (this.can.can('read host-set', hostSet)) {
      await this.router.transitionTo(
        'scopes.scope.host-catalogs.host-catalog.host-sets.host-set',
        hostSet,
      );
    } else {
      await this.router.transitionTo(
        'scopes.scope.host-catalogs.host-catalog.host-sets',
      );
    }
    await this.router.refresh();
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
  async delete(hostSet) {
    await hostSet.destroyRecord();
    await this.router.replaceWith(
      'scopes.scope.host-catalogs.host-catalog.host-sets',
    );
  }

  /**
   * Copies the contents of string array fields in order to force the instance
   * into a dirty state.  This ensures that `model.rollbackAttributes()` reverts
   * to the original expected array.
   *
   * The deep copy implemented here is required to ensure that both the
   * array itself as well as its members are all new.
   *
   * @param {hostSetModel} hostSet
   */
  @action
  edit(hostSet) {
    if (hostSet.preferred_endpoints) {
      hostSet.preferred_endpoints = structuredClone(
        hostSet.preferred_endpoints,
      );
    }
    if (hostSet.filters) {
      hostSet.filters = structuredClone(hostSet.filters);
    }
  }

  /**
   * Remove a host from the current host set and redirect to hosts index.
   * @param {HostSetModel} hostSet
   * @param {HostModel} host
   */
  @action
  @loading
  @confirm('questions.remove-confirm')
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('notifications.remove-success')
  async removeHost(hostSet, host) {
    const { scopeID, host_catalog_id: hostCatalogID } = hostSet;
    await hostSet.removeHost(host.id, {
      adapterOptions: { scopeID, hostCatalogID },
    });
    await this.router.refresh();
  }
}
