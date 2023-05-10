/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import ModelAbility from 'api/abilities/model';

export default class OverrideAuthMethodAbility extends ModelAbility {
  /**
   * These override abilities are temporary and just part of Phase 1
   * of LDAP auth method implementation.
   */

  get canRead() {
    return !this.model.isLDAP && super.canRead;
  }

  get canMakePrimary() {
    return !this.model.isLDAP;
  }
}
