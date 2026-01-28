/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';
export default class ScopesScopeGroupsGroupAddMembersRoute extends Route {
  // =services

  @service store;
  @service router;

  // =attributes

  queryParams = {
    scopeIds: {
      refreshModel: true,
      replace: true,
    },
  };

  // =methods

  /**
   * Preload all scopes recursively, but allow this to fail.
   */
  async beforeModel() {
    await this.store
      .query('scope', { scope_id: 'global', recursive: true })
      .catch(() => {});
  }

  /**
   * Loads all users and returns them with the group.
   * @return {Promise<{group: GroupModel, users: [UserModel], scopes: [ScopeModel] }> }
   */
  async model({ scopeIds }) {
    const group = this.modelFor('scopes.scope.groups.group');
    // filter out projects, since the user resource exists only on org and above
    const scopes = this.store
      .peekAll('scope')
      .filter((scope) => !scope.isProject);

    const query = { filters: { scope_id: [] } };

    scopeIds?.forEach((scopeID) => {
      query.filters.scope_id.push({ equals: scopeID });
    });

    const users = await this.store.query('user', {
      scope_id: 'global',
      recursive: true,
      query,
    });

    return { group, users, scopes };
  }
}
