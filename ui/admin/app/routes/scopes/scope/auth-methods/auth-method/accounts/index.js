/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';

export default class ScopesScopeAuthMethodsAuthMethodAccountsIndexRoute extends Route {
  setupController(controller) {
    const authMethod = this.modelFor('scopes.scope.auth-methods.auth-method');
    super.setupController(...arguments);
    controller.setProperties({ authMethod });
  }
}
