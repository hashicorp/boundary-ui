/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';

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
    const hostCatalog = this.modelFor(
      'scopes.scope.host-catalogs.host-catalog',
    );
    const { host_catalog_id } = host;
    if (host_catalog_id !== hostCatalog.id) {
      this.router.replaceWith(
        'scopes.scope.host-catalogs.host-catalog.hosts.host',
        host_catalog_id,
        host.id,
      );
    }
  }
}
