/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';

export default class ScopesScopeRolesRoleManageScopesIndexRoute extends Route {
  // =attributes

  queryParams = {
    showCheckIcon: {
      replace: true,
    },
  };

  // =methods

  /**
   * Sets showCheckIcon queryParam to default value when exiting this route.
   * @param {Controller} controller
   * @param {boolean} isExiting
   */
  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('showCheckIcon', false);
    }
  }
}
