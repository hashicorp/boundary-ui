/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import ModelAbility from 'api/abilities/model';

export default class OverrideAuthMethodAbility extends ModelAbility {
  /**
   * This override ensures that
   */
  get canRead() {
    return super.canRead && !this.model.isLDAP;
  }

  get canMakePrimary() {
    return !this.model.isLDAP;
  }
}
