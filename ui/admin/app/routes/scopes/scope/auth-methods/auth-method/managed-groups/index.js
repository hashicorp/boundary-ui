/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';

export default class ScopesScopeAuthMethodsAuthMethodManagedGroupsIndexRoute extends Route {
  setupController(controller) {
    const authMethod = this.modelFor('scopes.scope.auth-methods.auth-method');
    super.setupController(...arguments);
    controller.setProperties({ authMethod });
  }
}
