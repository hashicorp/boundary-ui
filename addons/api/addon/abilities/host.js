/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import ModelAbility from './model';

/**
 * Provides abilities for host sets.
 */
export default class HostAbility extends ModelAbility {
  // =permissions

  /**
   * @type {boolean}
   */
  get canRead() {
    const readAbility =
      !this.model.isUnknown && this.hasAuthorizedAction('read');
    if (this.resource_id) {
      return readAbility && this.resource_id === this.collection_id;
    }
    if (this.resource_ids) {
      return readAbility && this.resource_ids.includes(this.collection_id);
    }
    return readAbility;
  }
}
