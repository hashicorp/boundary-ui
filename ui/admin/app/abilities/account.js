/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import AccountAbility from 'api/abilities/account';
import { inject as service } from '@ember/service';

export default class OverrideAccountAbility extends AccountAbility {
  // =service
  @service features;

  /**
   * These override abilities are temporary and just part of Phase 1
   * of LDAP auth method implementation.
   */

  get canAddAccount() {
    return this.features.isEnabled('ldap-auth-methods') || !this.model.isLDAP;
  }

  get canRemoveAccount() {
    return this.features.isEnabled('ldap-auth-methods') || !this.model.isLDAP;
  }
}
