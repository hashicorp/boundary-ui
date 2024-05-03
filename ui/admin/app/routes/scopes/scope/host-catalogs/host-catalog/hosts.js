/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ScopesScopeHostCatalogsHostCatalogHostsRoute extends Route {
  // =services

  @service store;
  @service can;

  // =methods

  /**
   * Loads all hosts under the current host catalog and it's parent scope.
   * @return {Promise{[HostModel]}}
   */
  async model() {
    const hostCatalog = this.modelFor(
      'scopes.scope.host-catalogs.host-catalog',
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
}
