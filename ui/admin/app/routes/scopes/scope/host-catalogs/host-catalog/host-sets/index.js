/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
export default class ScopesScopeHostCatalogsHostCatalogHostSetsIndexRoute extends Route {
  // =methods
  setupController(controller) {
    const hostCatalog = this.modelFor(
      'scopes.scope.host-catalogs.host-catalog',
    );
    super.setupController(...arguments);
    controller.setProperties({ hostCatalog });
  }
}
