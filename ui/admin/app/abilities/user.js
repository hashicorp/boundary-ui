/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import UserAbility from 'api/abilities/user';
import { service } from '@ember/service';

export default class OverrideUserAbility extends UserAbility {
  // =service
  @service features;

  /**
   * These override abilities are temporary and just part of Phase 1
   * of LDAP auth method implementation.
   */

  get canAddAccount() {
    return this.features.isEnabled('ldap-auth-methods') || !this.account.isLDAP
      ? super.canAddAccount
      : false;
  }

  get canRemoveAccount() {
    return this.features.isEnabled('ldap-auth-methods') || !this.account.isLDAP
      ? super.canRemoveAccount
      : false;
  }
}
