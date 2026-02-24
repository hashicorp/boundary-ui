/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { all, hash } from 'rsvp';
import { service } from '@ember/service';

export default class ScopesScopeTargetsTargetHostSourcesRoute extends Route {
  // =services

  @service store;

  // =methods

  /**
   * Loads all host-sets and associated host-catalogs under the current target
   * and it's parent scope.
   * @return {Promise{[HostSetModel, HostCatalogModel]}}
   */
  beforeModel() {
    const { scopeID, host_sources } = this.modelFor(
      'scopes.scope.targets.target',
    );
    const promises = host_sources.map(
      ({ host_source_id, host_catalog_id: hostCatalogID }) =>
        hash({
          // TODO:  multiple host sets may belong to the same catalog,
          // resulting in the catalog being loaded multiple times.
          // An improvement would be to find the unique set of catalogs first.
          hostCatalog: this.store.findRecord('host-catalog', hostCatalogID, {
            adapterOptions: { scopeID },
          }),
          hostSet: this.store.findRecord('host-set', host_source_id, {
            adapterOptions: { scopeID, hostCatalogID },
          }),
        }),
    );
    return all(promises);
  }

  /**
   * Returns the previously loaded target instance.
   * @return {TargetModel}
   */
  model() {
    return this.modelFor('scopes.scope.targets.target');
  }
}
