/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { loading } from 'ember-loading';
import { notifySuccess, notifyError } from 'core/decorators/notify';

export default class ScopesScopeHostCatalogsHostCatalogHostSetsHostSetCreateAndAddHostRoute extends Route {
  // =services

  @service store;
  @service intl;
  @service router;

  // =methods

  /**
   * Creates a new unsaved host in current host catalog scope.
   * @return {Promise{HostSetModel,HostModel}}
   */
  async model() {
    const { id: host_catalog_id } = this.modelFor(
      'scopes.scope.host-catalogs.host-catalog'
    );

    return this.store.createRecord('host', {
      type: 'static',
      host_catalog_id,
    });
  }

  // =actions

  /**
   * Saves host and add it to current host set.
   * @param {HostSetModel,HostModel} model
   */
  @action
  @loading
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('notifications.add-success')
  async save(host) {
    const hostSet = this.modelFor(
      'scopes.scope.host-catalogs.host-catalog.host-sets.host-set'
    );
    await host.save();
    await hostSet.addHost(host.id);
    await this.router.replaceWith(
      'scopes.scope.host-catalogs.host-catalog.host-sets.host-set.hosts'
    );
  }

  /**
   * Redirect to hosts in host set as if nothing ever happened.
   */
  @action
  cancel() {
    this.router.replaceWith(
      'scopes.scope.host-catalogs.host-catalog.host-sets.host-set.hosts'
    );
  }
}
