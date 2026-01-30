/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';

export default class ScopesScopeRolesRoleAddGrantTemplatesRoute extends Route {
  // =attributes

  queryParams = {
    search: {
      refreshModel: true,
      replace: true,
    },
    page: {
      refreshModel: true,
      replace: true,
    },
    pageSize: {
      refreshModel: true,
      replace: true,
    },
  };

  // =methods

  /**
   * Returns the current role
   * @return {{role: RoleModel}}
   */
  async model() {
    return this.modelFor('scopes.scope.roles.role');
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('search', '');
      controller.set('page', 1);
      controller.set('pageSize', 10);
    }
  }
}
