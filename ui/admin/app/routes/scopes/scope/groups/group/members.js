/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ScopesScopeGroupsGroupMembersRoute extends Route {
  // =services

  @service store;

  // =methods

  /**
   * Returns users associated with this group.
   * @return {Promise<{group: GroupModel, members: [UserModel]}>}
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
}
