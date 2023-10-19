/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

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
   * @return {HostModel}
   */
  async model({ host_id }) {
    return this.store.findRecord('host', host_id, { reload: true });
  }

  redirect(host) {
    const hostSet = this.modelFor(
      'scopes.scope.host-catalogs.host-catalog.host-sets.host-set'
    );
    if (
      this.can.cannot('read host', host, {
        resource_ids: host.host_set_ids,
        collection_id: hostSet.id,
      })
    ) {
      this.router.transitionTo(
        'scopes.scope.host-catalogs.host-catalog.host-sets.host-set.hosts.host',
        host.host_set_ids[0],
        host.id
      );
    }
  }
}
