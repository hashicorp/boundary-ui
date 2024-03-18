/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { hash } from 'rsvp';

export default class ScopesScopeGroupsGroupMembersRoute extends Route {
  // =services

  @service intl;

  @service resourceFilterStore;

  // =methods

  /**
   * Returns users associated with this group.
   * @return {Promise{group: GroupModel, members: Promise{[UserModel]}}}
   */
  model() {
    const group = this.modelFor('scopes.scope.groups.group');
    return hash({
      group,
      members: group.member_ids?.length
        ? this.resourceFilterStore.queryBy(
            'user',
            { id: group.member_ids },
            { scope_id: 'global', recursive: true },
          )
        : [],
    });
  }
}
