/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { loading } from 'ember-loading';
import { confirm } from 'core/decorators/confirm';
import { notifySuccess, notifyError } from 'core/decorators/notify';

export default class ScopesScopeHostCatalogsHostCatalogHostsRoute extends Route {
  // =services

  @service store;
  @service intl;
  @service can;
  @service router;

  // =methods

  /**
   * Loads all hosts under the current host catalog and it's parent scope.
   * @return {Promise{[HostModel]}}
   */
  async model() {
    const hostCatalog = this.modelFor(
      'scopes.scope.host-catalogs.host-catalog'
    );
    const { id: host_catalog_id } = hostCatalog;
    let hosts;

    if (
      this.can.can('list model', hostCatalog, {
        collection: 'hosts',
      })
    ) {
      hosts = await this.store.query('host', { host_catalog_id });
    }

    return {
      hostCatalog,
      hosts,
    };
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
      this.router.transitionTo('scopes.scope.host-catalogs.host-catalog.hosts');
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
    if (this.can.can('read model', host)) {
      await this.router.transitionTo(
        'scopes.scope.host-catalogs.host-catalog.hosts.host',
        host
      );
    } else {
      await this.router.transitionTo(
        'scopes.scope.host-catalogs.host-catalog.hosts'
      );
    }
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
    await this.router.replaceWith(
      'scopes.scope.host-catalogs.host-catalog.hosts'
    );
    this.refresh();
  }
}
