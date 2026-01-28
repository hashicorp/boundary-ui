/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ScopesScopeRolesRoleIndexRoute extends Route {
  // =services

  @service store;

  // =methods

  /**
   * Pre-loads all scopes since they will be necessary in sub-routes.
   * @param {RoleModel} role
   */
  async afterModel(role) {
    if (!role.scope.isProject) {
      await this.store.query('scope', {
        scope_id: role.scope.id,
        recursive: true,
      });
    }
  }
}
