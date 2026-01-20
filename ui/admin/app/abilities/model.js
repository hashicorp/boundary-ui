/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
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
