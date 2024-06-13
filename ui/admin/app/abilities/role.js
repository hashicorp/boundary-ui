/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import RoleAbility from 'api/abilities/role';
import { inject as service } from '@ember/service';

export default class OverrideRoleAbility extends RoleAbility {
  //service

  @service features;

  /**
   * These override abilities are temporary and just part of Phase 1
   * of LDAP auth method implementation.
   */

  get canSetGrantScopes() {
    return !this.model.scope.isProject ? super.canSetGrantScopes : false;
  }
}
