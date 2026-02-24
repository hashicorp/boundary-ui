/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { computed, action } from '@ember/object';
import { A } from '@ember/array';

export default class FormGroupAddMembersComponent extends Component {
  // =properties

  /**
   * Array of selected user IDs.
   * @type {EmberArray}
   */
  selectedMemberIDs = A();

  /**
   * Host sets not already added to the target.
   * @type {[UserModel]}
   */
  @computed('args.{model.member_ids.[],users.[]}')
  get availableUsers() {
    const memberIDs = this.args.model.member_ids;
    const users = this.args.users;
    return users.filter(({ id }) => !memberIDs.includes(id));
  }

  // =actions

  @action
  toggleMember(user) {
    if (!this.selectedMemberIDs.includes(user.id)) {
      this.selectedMemberIDs.addObject(user.id);
    } else {
      this.selectedMemberIDs.removeObject(user.id);
    }
  }

  @action
  submit(fn) {
    fn(this.selectedMemberIDs);
  }
}
