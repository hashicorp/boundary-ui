/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ScopesScopeHostCatalogsHostCatalogHostsNewRoute extends Route {
  // =services

  @service store;
  @service can;
  @service router;

  // =methods

  /**
   * Redirect to parent route when host-catalog does not have create authorized action.
   */
  beforeModel() {
    const hostCatalog = this.modelFor(
      'scopes.scope.host-catalogs.host-catalog',
    );
    if (this.can.cannot('create model', hostCatalog, { collection: 'hosts' })) {
      this.router.replaceWith('scopes.scope.host-catalogs.host-catalog.hosts');
    }
  }

  /**
   * Creates a new unsaved host in current host catalog scope.
   * @return {HostModel}
   */
  model() {
    const { id: host_catalog_id } = this.modelFor(
      'scopes.scope.host-catalogs.host-catalog',
    );
    return this.store.createRecord('host', {
      type: 'static',
      host_catalog_id,
    });
  }
}
