/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { hash, all } from 'rsvp';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { loading } from 'ember-loading';
import { confirm } from 'core/decorators/confirm';
import { notifySuccess, notifyError } from 'core/decorators/notify';

export default class ScopesScopeHostCatalogsHostCatalogHostSetsHostSetHostsRoute extends Route {
  // =services

  @service store;
  @service intl;

  // =methods

  /**
   * Loads all hosts under the current host set.
   * @return {Promise{HostSetModel,[HostModel]}}
   */
  async model() {
    const hostSet = this.modelFor(
      'scopes.scope.host-catalogs.host-catalog.host-sets.host-set'
    );
    return hash({
      hostSet,
      hosts: all(
        hostSet.host_ids.map((hostID) =>
          this.store.findRecord('host', hostID, { reload: true })
        )
      ),
    });
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
    const scopeID = this.modelFor('scopes.scope').id;
    const hostCatalogID = this.modelFor(
      'scopes.scope.host-catalogs.host-catalog'
    ).id;
    await hostSet.removeHost(host.id, {
      adapterOptions: { scopeID, hostCatalogID },
    });
    this.refresh();
  }
}
