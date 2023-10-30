/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ScopesScopeHostCatalogsHostCatalogHostSetsNewRoute extends Route {
  // =services

  @service store;
  @service router;

  // =methods
  /**
   * Creates a new unsaved host set in current host catalog scope.
   * @return {HostSetModel}
   */
  model() {
    const { id: host_catalog_id, compositeType } = this.modelFor(
      'scopes.scope.host-catalogs.host-catalog'
    );
    return this.store.createRecord('host-set', {
      compositeType,
      host_catalog_id,
    });
  }
}
