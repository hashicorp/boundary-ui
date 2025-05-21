/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { restartableTask, timeout } from 'ember-concurrency';

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

  allSessions;
  associatedUsers = [];
  associatedTargets = [];

  // =methods

  /**
   * Loads all sessions under the current scope and encapsulates them into
   * an array of objects containing their associated users and targets.
   * @return {Promise{[{sessions: [SessionModel], allSessions: [SessionModel], associatedUsers: [UserModel], associatedTargets: [TargetModel], totalItems: number}]}}
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
        attribute: sortAttribute,
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

      // Query all sessions, users, and targets for defining filtering values if entering route for the first time
      if (!this.allSessions) {
        await this.getAllSessions(scope_id);
      }
      if (this.associatedUsers.length === 0) {
        await this.getAssociatedUsers(scope);
      }
      if (this.associatedTargets.length === 0) {
        await this.getAssociatedTargets(scope);
      }

      return {
        sessions,
        allSessions: this.allSessions,
        associatedUsers: this.associatedUsers,
        associatedTargets: this.associatedTargets,
        totalItems,
      };
    },
  );

  /**
   * Get all the sessions but only load them once when entering the route.
   * @param scope_id
   * @returns {Promise<void>}
   */
  async getAllSessions(scope_id) {
    const allSessionsQuery = {
      scope_id,
      include_terminated: true,
      query: { filters: { scope_id: [{ equals: scope_id }] } },
    };
    this.allSessions = await this.store.query('session', allSessionsQuery, {
      pushToStore: false,
    });
  }

  /**
   * Get all the users but only load them once when entering the route.
   * @param scope
   * @returns {Promise<void>}
   */
  async getAssociatedUsers(scope) {
    const orgScope = await this.store.findRecord('scope', scope.scope.id);
    const globalScope = await this.store.findRecord('scope', 'global');

    if (
      this.can.can('list model', globalScope, { collection: 'users' }) &&
      this.can.can('list model', orgScope, { collection: 'users' })
    ) {
      const uniqueSessionUserIds = new Set(
        this.allSessions
          .filter((session) => session.user_id)
          .map((session) => session.user_id),
      );
      const filters = {
        id: { values: [] },
      };
      uniqueSessionUserIds.forEach((userId) => {
        filters.id.values.push({ equals: userId });
      });
      const associatedUsersQuery = {
        scope_id: 'global',
        recursive: true,
        query: { filters },
      };
      this.associatedUsers = await this.store.query(
        'user',
        associatedUsersQuery,
      );
    }
  }

  /**
   * Get all the targets but only load them once when entering the route.
   * @param scope
   * @returns {Promise<void>}
   */
  async getAssociatedTargets(scope) {
    if (this.can.can('list model', scope, { collection: 'targets' })) {
      const uniqueSessionTargetIds = new Set(
        this.allSessions
          .filter((session) => session.target_id)
          .map((session) => session.target_id),
      );
      const filters = { id: { values: [] } };
      uniqueSessionTargetIds.forEach((targetId) => {
        filters.id.values.push({ equals: targetId });
      });
      const associatedTargetsQuery = {
        scope_id: scope.id,
        query: { filters },
      };
      this.associatedTargets = await this.store.query(
        'target',
        associatedTargetsQuery,
      );
    }
  }

  // =actions

  /**
   * refreshes all session route data.
   */
  @action
  async refreshAll() {
    const scope = this.modelFor('scopes.scope');

    await this.getAllSessions(scope.id);
    await this.getAssociatedUsers(scope);
    await this.getAssociatedTargets(scope);

    return super.refresh(...arguments);
  }
}
