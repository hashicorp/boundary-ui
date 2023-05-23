/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import AuthMethodAbility from 'api/abilities/auth-method';
import { inject as service } from '@ember/service';

export default class OverrideAuthMethodAbility extends AuthMethodAbility {
  //service
  @service features;

  /**
   * These override abilities are temporary and just part of Phase 1
   * of LDAP auth method implementation.
   */

  get canRead() {
    return this.features.isEnabled('ldap-auth-methods') || !this.model.isLDAP
      ? super.canRead
      : false;
  }

  get canMakePrimary() {
    return this.features.isEnabled('ldap-auth-methods') || !this.model.isLDAP;
  }
}
