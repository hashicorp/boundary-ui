/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ScopesScopeHostCatalogsHostCatalogHostSetsRoute extends Route {
  // =services

  @service store;
  @service can;

  // =methods

  /**
   * Loads all host-sets under the current host catalog and it's parent scope.
   * @return {Promise{[HostSetModel]}}
   */
  async model() {
    const hostCatalog = this.modelFor(
      'scopes.scope.host-catalogs.host-catalog',
    );
    const { id: host_catalog_id } = hostCatalog;
    let hostSets;

    if (
      this.can.can('list model', hostCatalog, {
        collection: 'host-sets',
      })
    ) {
      hostSets = await this.store.query('host-set', { host_catalog_id });
    }

    return {
      hostCatalog,
      hostSets,
    };
  }
}
