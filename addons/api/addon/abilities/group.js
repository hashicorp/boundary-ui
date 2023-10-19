/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import ModelAbility from './model';

/**
 * Provides abilities for groups.
 */
export default class GroupAbility extends ModelAbility {
  // =permissions

  /**
   * @type {boolean}
   */
  get canRead() {
    const readAbility = this.hasAuthorizedAction('read');
    if (this.resource_id) {
      return readAbility && this.resource_id === this.collection_id;
    }
    return readAbility;
  }

  /**
   * @type {boolean}
   */
  get canAddMembers() {
    return this.hasAuthorizedAction('add-members');
  }

  /**
   * @type {boolean}
   */
  get canRemoveMembers() {
    return this.hasAuthorizedAction('remove-members');
  }
}
