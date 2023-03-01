/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { hash } from 'rsvp';
import { loading } from 'ember-loading';
import { notifySuccess, notifyError } from 'core/decorators/notify';

export default class ScopesScopeHostCatalogsHostCatalogHostSetsHostSetAddHostsRoute extends Route {
  // =services

  @service store;
  @service intl;
  @service router;

  // =methods

  /**
   * Empty out any previously loaded hosts.
   */
  beforeModel() {
    this.store.unloadAll('host');
  }

  /**
   * Loads current host set and all hosts under the current host catalog.
   * @return {Promise{HostSetModel,[HostModel]}}
   */
  async model() {
    const { id: host_catalog_id } = this.modelFor(
      'scopes.scope.host-catalogs.host-catalog'
    );
    return hash({
      hostSet: this.modelFor(
        'scopes.scope.host-catalogs.host-catalog.host-sets.host-set'
      ),
      hosts: this.store.query('host', { host_catalog_id }),
    });
  }

  // =actions

  /**
   * Saves host IDs on the host set.
   * @param {HostSetModel} hostSet
   */
  @action
  @loading
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('notifications.add-success')
  async addHosts(hostSet, hostIDs) {
    await hostSet.addHosts(hostIDs);
    await this.router.replaceWith(
      'scopes.scope.host-catalogs.host-catalog.host-sets.host-set.hosts'
    );
  }

  /**
   * Redirect to hosts as if nothing ever happened.
   */
  @action
  cancel() {
    this.router.replaceWith(
      'scopes.scope.host-catalogs.host-catalog.host-sets.host-set.hosts'
    );
  }
}
