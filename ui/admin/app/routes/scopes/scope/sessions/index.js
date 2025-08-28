/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { restartableTask, timeout } from 'ember-concurrency';
import chunk from 'lodash/chunk';

// Maximum expression tree depth is 1000 so
// we limit the number of expressions in a query.
// See "Maximum Depth Of An Expression Tree" in
// https://www.sqlite.org/limits.html
const MAX_EXPR_NUM = 999;

export default class ScopesScopeSessionsIndexRoute extends Route {
  // =services

  @service can;
  @service store;

  // =attributes

  queryParams = {
    search: {
      refreshModel: true,
      replace: true,
    },
    users: {
      refreshModel: true,
      replace: true,
    },
    targets: {
      refreshModel: true,
      replace: true,
    },
    status: {
      refreshModel: true,
      replace: true,
    },
    page: {
      refreshModel: true,
    },
    pageSize: {
      refreshModel: true,
    },
    sortAttribute: {
      refreshModel: true,
      replace: true,
    },
    sortDirection: {
      refreshModel: true,
      replace: true,
    },
  };

  // =methods

  /**
   * Loads all sessions under the current scope and encapsulates them into
   * an array of objects containing their associated users and targets.
   * @return {Promise<{sessions: SessionModel[], allSessions: SessionModel[], associatedUsers: UserModel[], associatedTargets: TargetModel[], totalItems: number>}>}
   */
  async model(params) {
    const useDebounce =
      this.retrieveData?.lastPerformed?.args?.[0].search !== params.search;
    return this.retrieveData.perform({ ...params, useDebounce });
  }

  retrieveData = restartableTask(
    async ({
      search,
      users,
      targets,
      status,
      page,
      pageSize,
      sortAttribute,
      sortDirection,
      useDebounce,
    }) => {
      if (useDebounce) {
        await timeout(250);
      }

      const scope = this.modelFor('scopes.scope');
      const { id: scope_id } = scope;

      const filters = {
        scope_id: [{ equals: scope_id }],
        status: [],
        user_id: [],
        target_id: [],
      };
      users.forEach((user) => {
        filters.user_id.push({ equals: user });
      });
      targets.forEach((target) => {
        filters.target_id.push({ equals: target });
      });
      status.forEach((item) => {
        filters.status.push({ equals: item });
      });

      const sort = {
        attributes: [sortAttribute],
        direction: sortDirection,
      };

      const queryOptions = {
        scope_id,
        include_terminated: true,
        query: { search, filters, sort },
        page,
        pageSize,
      };

      const sessions = await this.store.query('session', queryOptions);
      const totalItems = sessions.meta?.totalItems;

      const allSessions = await this.getAllSessions(scope_id);
      const associatedUsers = await this.getAssociatedUsers(scope, allSessions);
      const associatedTargets = await this.getAssociatedTargets(
        scope,
        allSessions,
      );

      return {
        sessions,
        allSessions,
        associatedUsers,
        associatedTargets,
        totalItems,
      };
    },
  );

  /**
   * Get all the sessions for a scope id
   * @param scope_id
   * @returns {Promise<SessionModel[]>}
   */
  async getAllSessions(scope_id) {
    const allSessionsQuery = {
      scope_id,
      include_terminated: true,
      query: { filters: { scope_id: [{ equals: scope_id }] } },
    };

    return this.store.query('session', allSessionsQuery, {
      pushToStore: false,
    });
  }

  /**
   * Get all the users for a given scope and array of scope's sessions.
   * @param scope
   * @returns {Promise<UserModel[]>}
   */
  async getAssociatedUsers(scope, allSessions) {
    const orgScope = await this.store.findRecord('scope', scope.scope.id);
    const globalScope = await this.store.findRecord('scope', 'global');

    if (
      this.can.can('list model', globalScope, { collection: 'users' }) &&
      this.can.can('list model', orgScope, { collection: 'users' })
    ) {
      const uniqueSessionUserIds = [
        ...new Set(
          allSessions
            .filter((session) => session.user_id)
            .map((session) => session.user_id),
        ),
      ];
      const chunkedUserIds = chunk(uniqueSessionUserIds, MAX_EXPR_NUM);
      const associatedUsersPromises = chunkedUserIds.map((userIds) =>
        this.store.query('user', {
          scope_id: 'global',
          recursive: true,
          query: {
            filters: {
              id: { values: userIds.map((userId) => ({ equals: userId })) },
            },
          },
        }),
      );
      const usersArray = await Promise.all(associatedUsersPromises);
      return usersArray.flat();
    }

    return [];
  }

  /**
   * Get all the targets for a given scope and array of scope's sessions.
   * @param scope
   * @returns {Promise<TargetModel[]>}
   */
  async getAssociatedTargets(scope, allSessions) {
    if (this.can.can('list model', scope, { collection: 'targets' })) {
      const uniqueSessionTargetIds = [
        ...new Set(
          allSessions
            .filter((session) => session.target_id)
            .map((session) => session.target_id),
        ),
      ];

      const chunkedTargetIds = chunk(uniqueSessionTargetIds, MAX_EXPR_NUM);
      const associatedTargetsPromises = chunkedTargetIds.map((targetIds) =>
        this.store.query('target', {
          scope_id: scope.id,
          query: {
            filters: {
              id: {
                values: targetIds.map((targetId) => ({ equals: targetId })),
              },
            },
          },
        }),
      );
      const targetsArray = await Promise.all(associatedTargetsPromises);
      return targetsArray.flat();
    }

    return [];
  }

  // =actions

  /**
   * refreshes all session route data.
   */
  @action
  async refreshAll() {
    return super.refresh(...arguments);
  }
}
