/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import ModelAbility from './model';

/**
 * Provides abilities for host sets.
 */
export default class HostSetAbility extends ModelAbility {
  // =permissions

  /**
   * @type {boolean}
   */
  get canAddHosts() {
    return this.hasAuthorizedAction('add-hosts');
  }

  /**
   * @type {boolean}
   */
  get canRemoveHosts() {
    return this.hasAuthorizedAction('remove-hosts');
  }

  /**
   * @type {boolean}
   */
  get canRead() {
    const readAbility =
      !this.model.isUnknown && this.hasAuthorizedAction('read');
    if (this.resource_id) {
      return readAbility && this.resource_id === this.collection_id;
    }
    return readAbility;
  }
}
