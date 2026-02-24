/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
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
