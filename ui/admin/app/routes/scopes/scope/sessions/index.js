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

  scopeContext;

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

      // refresh the saved current scope context when the scope changes or if it has not been previously set
      if (this.scopeContext?.scopeId !== scope.id) {
        this.scopeContext = await this.getScopeContext(scope);
      }

      return {
        sessions,
        scopeContext: this.scopeContext,
        totalItems,
      };
    },
  );

  /**
   *
   * @param {*} scope
   * @returns {Promise<{ scopeId: string, allSessions: [SessionModel], users: [UserModel], targets: [TargetModel] }>}
   */
  async getScopeContext(scope) {
    const orgScope = await this.store.findRecord('scope', scope.scope.id);
    const globalScope = await this.store.findRecord('scope', 'global');

    //
    // `allSessions`
    //
    const allSessions = await this.store.query(
      'session',
      {
        scope_id: scope.id,
        include_terminated: true,
        query: { filters: { scope_id: [{ equals: scope.id }] } },
      },
      {
        pushToStore: false,
      },
    );

    //
    // `users`
    //
    let users = [];
    {
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

        const filters = {
          id: {
            values: uniqueSessionUserIds.map((userId) => ({
              equals: userId,
            })),
          },
        };

        users = await this.store.query('user', {
          scope_id: 'global',
          recursive: true,
          query: { filters },
        });
      }
    }

    //
    // `targets`
    //
    let targets = [];
    {
      if (this.can.can('list model', scope, { collection: 'targets' })) {
        const uniqueSessionTargetIds = [
          ...new Set(
            allSessions
              .filter((session) => session.target_id)
              .map((session) => session.target_id),
          ),
        ];

        const filters = {
          id: {
            values: uniqueSessionTargetIds.map((targetId) => ({
              equals: targetId,
            })),
          },
        };

        targets = await this.store.query('target', {
          scope_id: scope.id,
          query: { filters },
        });
      }
    }

    return Object.freeze({
      scopeId: scope.id,
      allSessions,
      users,
      targets,
    });
  }

  // =actions

  /**
   * refreshes all session route data.
   */
  @action
  async refreshAll() {
    this.scopeContext = undefined;
    return super.refresh(...arguments);
  }
}
