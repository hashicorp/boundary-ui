/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import TargetAbility from 'api/abilities/target';

export default class OverrideTargetAbility extends TargetAbility {
  /**
   *
   * @type {boolean}
   */
  get canInitiateConnection() {
    return this.model.address || this.model.host_sources?.length;
  }
}
