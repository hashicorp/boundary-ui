/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ScopesScopeHostCatalogsHostCatalogHostSetsNewRoute extends Route {
  // =services

  @service store;
  @service router;
  @service can;

  // =methods

  /**
   * Redirect to parent route when host-catalog does not have create authorized action.
   */
  beforeModel() {
    const hostCatalog = this.modelFor(
      'scopes.scope.host-catalogs.host-catalog',
    );
    if (
      this.can.cannot('create model', hostCatalog, { collection: 'host-sets' })
    ) {
      this.router.replaceWith(
        'scopes.scope.host-catalogs.host-catalog.host-sets',
      );
    }
  }

  /**
   * Creates a new unsaved host set in current host catalog scope.
   * @return {HostSetModel}
   */
  model() {
    const { id: host_catalog_id, compositeType } = this.modelFor(
      'scopes.scope.host-catalogs.host-catalog',
    );
    return this.store.createRecord('host-set', {
      compositeType,
      host_catalog_id,
    });
  }
}
