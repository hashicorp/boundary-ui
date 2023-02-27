/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { hash } from 'rsvp';
import { loading } from 'ember-loading';
import { confirm } from 'core/decorators/confirm';
import { notifySuccess, notifyError } from 'core/decorators/notify';

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
            { scope_id: 'global', recursive: true }
          )
        : [],
    });
  }

  // =actions

  /**
   * Remove a member from the current role and redirect to members index.
   * @param {GroupModel} group
   * @param {UserModel} member
   */
  @action
  @loading
  @confirm('questions.remove-confirm')
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('notifications.remove-success')
  async removeMember(group, member) {
    await group.removeMember(member.id);
    this.refresh();
  }
}
