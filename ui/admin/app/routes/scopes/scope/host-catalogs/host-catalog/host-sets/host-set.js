/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { paramValueFinder } from 'admin/utils/param-value-finder';

export default class ScopesScopeHostCatalogsHostCatalogHostSetsHostSetRoute extends Route {
  // =services

  @service store;
  @service abilities;
  @service router;

  // =methods

  /**
   * Load a host-set using current host-catalog and its parent scope.
   * @param {object} params
   * @param {string} params.host_set_id
   * @return {Promise{HostSetModel}}
   */
  async model({ host_set_id }) {
    return this.store.findRecord('host-set', host_set_id, { reload: true });
  }

  /**
   * Redirects to route with correct host-catalog id if incorrect.
   * @param {HostSetModel} hostSet
   * @param {object} transition
   */
  redirect(hostSet, transition) {
    const hostCatalog = this.modelFor(
      'scopes.scope.host-catalogs.host-catalog',
    );
    const { host_catalog_id } = hostSet;
    if (host_catalog_id !== hostCatalog.id) {
      let paramValues = paramValueFinder('host-set', transition.to.parent);
      this.router.replaceWith(
        transition.to.name,
        host_catalog_id,
        hostSet.id,
        ...paramValues,
      );
    }
  }
}
