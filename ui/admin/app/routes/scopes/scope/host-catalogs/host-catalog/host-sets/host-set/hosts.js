/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { hash, all } from 'rsvp';
import { service } from '@ember/service';

export default class ScopesScopeHostCatalogsHostCatalogHostSetsHostSetHostsRoute extends Route {
  // =services

  @service store;

  // =methods

  /**
   * Loads all hosts under the current host set.
   * @return {Promise{HostSetModel,[HostModel]}}
   */
  async model() {
    const hostSet = this.modelFor(
      'scopes.scope.host-catalogs.host-catalog.host-sets.host-set',
    );
    return hash({
      hostSet,
      hosts: all(
        hostSet.host_ids.map((hostID) =>
          this.store.findRecord('host', hostID, { reload: true }),
        ),
      ),
    });
  }
}
