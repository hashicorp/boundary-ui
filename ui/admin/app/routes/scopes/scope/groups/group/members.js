/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { loading } from 'ember-loading';
import { confirm } from 'core/decorators/confirm';
import { notifySuccess, notifyError } from 'core/decorators/notify';

export default class ScopesScopeGroupsGroupMembersRoute extends Route {
  // =services

  @service store;

  // =methods

  /**
   * Returns users associated with this group.
   * @return {Promise{group: GroupModel, members: [UserModel]}}
   */
  async model() {
    const group = this.modelFor('scopes.scope.groups.group');
    const members = await this.getUsers(group.member_ids);
    return { group, members };
  }

  /**
   * Retrieves group members of user type.
   * @param {array} ids
   * @return {Promise[UserModel]}
   */
  async getUsers(ids) {
    let users = [];
    if (ids?.length) {
      const query = { filters: { id: [] } };
      ids.forEach((id) => query.filters.id.push({ equals: id }));
      users = await this.store.query('user', {
        scope_id: 'global',
        recursive: true,
        query,
      });
    }
    return users;
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
