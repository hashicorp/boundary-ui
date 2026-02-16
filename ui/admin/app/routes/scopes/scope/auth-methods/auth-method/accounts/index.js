/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';

export default class ScopesScopeAuthMethodsAuthMethodAccountsIndexRoute extends Route {
  setupController(controller) {
    const authMethod = this.modelFor('scopes.scope.auth-methods.auth-method');
    super.setupController(...arguments);
    controller.setProperties({ authMethod });
  }
}
