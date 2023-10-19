/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ScopesScopeHostCatalogsHostCatalogHostsNewRoute extends Route {
  // =services

  @service store;
  @service can;
  @service router;

  // =methods

  beforeModel() {
    const hostCatalog = this.modelFor(
      'scopes.scope.host-catalogs.host-catalog'
    );
    if (this.can.cannot('create model', hostCatalog, { collection: 'hosts' })) {
      this.router.transitionTo(
        'scopes.scope.host-catalogs.host-catalog.hosts',
        hostCatalog.scopeID,
        hostCatalog.id
      );
    }
  }

  /**
   * Creates a new unsaved host in current host catalog scope.
   * @return {HostModel}
   */
  model() {
    const { id: host_catalog_id } = this.modelFor(
      'scopes.scope.host-catalogs.host-catalog'
    );
    return this.store.createRecord('host', {
      type: 'static',
      host_catalog_id,
    });
  }
}
