/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Controller, { inject as controller } from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { loading } from 'ember-loading';
import { confirm } from 'core/decorators/confirm';
import { notifySuccess, notifyError } from 'core/decorators/notify';

export default class ScopesScopeHostCatalogsHostCatalogHostSetsIndexController extends Controller {
  @controller('scopes/scope/host-catalogs/index') hostCatalogs;

  // =services

  @service router;
  @service can;

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
        'scopes.scope.host-catalogs.host-catalog.host-sets',
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
    isNew ? 'notifications.create-success' : 'notifications.save-success',
  )
  async save(hostSet) {
    await hostSet.save();
    if (this.can.can('read model', hostSet)) {
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
