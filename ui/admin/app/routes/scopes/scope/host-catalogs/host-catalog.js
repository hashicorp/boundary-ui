/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { paramValueFinder } from 'admin/utils/route-info';

export default class ScopesScopeHostCatalogsHostCatalogRoute extends Route {
  // =services

  @service store;
  @service can;
  @service router;

  // =methods

  /**
   * Load a host catalog.
   * @param {object} params
   * @param {string} params.host_catalog_id
   * @return {HostCatalogModel}
   */
  async model({ host_catalog_id }) {
    return this.store.findRecord('host-catalog', host_catalog_id);
  }

  redirect(hostCatalog, transition) {
    const scope = this.modelFor('scopes.scope');
    if (
      this.can.cannot('read host-catalog', hostCatalog, {
        resource_id: hostCatalog.scopeID,
        collection_id: scope.id,
      })
    ) {
      let paramValues = paramValueFinder('host-catalog', transition.to.parent);
      this.router.transitionTo(
        transition.to.name,
        hostCatalog.scopeID,
        hostCatalog.id,
        ...paramValues
      );
    }
  }
}
