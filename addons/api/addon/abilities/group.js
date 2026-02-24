/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
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
