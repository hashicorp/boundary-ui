/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import ModelAbility from 'api/abilities/model';

export default class OverrideModelAbility extends ModelAbility {
  /**
   * Navigating to a resource is allowed if either list or create grants
   * are present.
   * @type {boolean}
   */
  get canNavigate() {
    return this.canList || this.canCreate;
  }
}
