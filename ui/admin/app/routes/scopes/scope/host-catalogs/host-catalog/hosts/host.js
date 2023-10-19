/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ScopesScopeHostCatalogsHostCatalogHostsHostRoute extends Route {
  // =services

  @service store;
  @service can;
  @service router;

  // =methods

  /**
   * Load a host using current host-catalog and it's parent scope.
   * @param {object} params
   * @param {string} params.host_id
   * @return {HostModel}
   */
  async model({ host_id }) {
    return this.store.findRecord('host', host_id, { reload: true });
  }

  redirect(host) {
    const hostCatalog = this.modelFor(
      'scopes.scope.host-catalogs.host-catalog'
    );
    const { host_catalog_id } = host;
    if (
      this.can.cannot('read host', host, {
        resource_id: host_catalog_id,
        collection_id: hostCatalog.id,
      })
    ) {
      this.router.transitionTo(
        'scopes.scope.host-catalogs.host-catalog.hosts.host',
        host_catalog_id,
        host.id
      );
    }
  }
}
