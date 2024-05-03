/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { hash } from 'rsvp';

export default class ScopesScopeHostCatalogsHostCatalogHostSetsHostSetAddHostsRoute extends Route {
  // =services

  @service store;
  @service intl;
  @service router;

  // =methods

  /**
   * Empty out any previously loaded hosts.
   */
  beforeModel() {
    this.store.unloadAll('host');
  }

  /**
   * Loads current host set and all hosts under the current host catalog.
   * @return {Promise{HostSetModel,[HostModel]}}
   */
  async model() {
    const { id: host_catalog_id } = this.modelFor(
      'scopes.scope.host-catalogs.host-catalog',
    );
    return hash({
      hostSet: this.modelFor(
        'scopes.scope.host-catalogs.host-catalog.host-sets.host-set',
      ),
      hosts: this.store.query('host', { host_catalog_id }),
    });
  }
}
