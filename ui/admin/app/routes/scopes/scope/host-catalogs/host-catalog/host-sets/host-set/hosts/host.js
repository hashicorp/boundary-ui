/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ScopesScopeHostCatalogsHostCatalogHostSetsHostSetHostsHostRoute extends Route {
  // =services

  @service store;
  @service can;
  @service router;

  // =methods

  /**
   * Load a host in current scope.
   * @param {object} params
   * @param {string} params.host_id
   * @return {Promise{HostModel}}
   */
  async model({ host_id }) {
    return this.store.findRecord('host', host_id, { reload: true });
  }

  /**
   * Redirects to route with correct host-catalog id if incorrect.
   * @param {HostModel} host
   */
  redirect(host) {
    const hostSet = this.modelFor(
      'scopes.scope.host-catalogs.host-catalog.host-sets.host-set',
    );
    if (host.host_set_ids !== hostSet.id) {
      this.router.replaceWith(
        'scopes.scope.host-catalogs.host-catalog.host-sets.host-set.hosts.host',
        host.host_set_ids[0],
        host.id,
      );
    }
  }
}
