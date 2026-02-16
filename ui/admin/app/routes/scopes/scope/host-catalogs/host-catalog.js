/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { paramValueFinder } from 'admin/utils/param-value-finder';

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
   * @return {Promise{HostCatalogModel}}
   */
  async model({ host_catalog_id }) {
    return this.store.findRecord('host-catalog', host_catalog_id, {
      reload: true,
    });
  }

  /**
   * Redirects to route with correct scope id if incorrect.
   * @param {HostCatalogModel} hostCatalog
   * @param {object} transition
   */
  redirect(hostCatalog, transition) {
    const scope = this.modelFor('scopes.scope');
    if (hostCatalog.scopeID !== scope.id) {
      let paramValues = paramValueFinder('host-catalog', transition.to.parent);
      this.router.replaceWith(
        transition.to.name,
        hostCatalog.scopeID,
        hostCatalog.id,
        ...paramValues,
      );
    }
  }
}
