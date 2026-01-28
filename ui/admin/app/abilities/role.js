/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import RoleAbility from 'api/abilities/role';

export default class OverrideRoleAbility extends RoleAbility {
  /**
   * This override ensures that a user can only set grant scopes
   * on global and org level roles.
   * @type {boolean}
   */
  get canSetGrantScopes() {
    return !this.model.scope.isProject && super.canSetGrantScopes;
  }
}
