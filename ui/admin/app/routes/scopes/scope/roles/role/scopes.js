/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';

export default class ScopesScopeRolesRoleScopesRoute extends Route {
  // =methods

  model() {
    return this.modelFor('scopes.scope.roles.role');
  }
}
