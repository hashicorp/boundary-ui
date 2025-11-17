/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';
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

  // =methods

  /**
   * Loads all sessions under the current scope and encapsulates them into
   * an array of objects containing their associated users and targets.
   * @param {Object} params
   * @returns {Promise<{sessions: SessionModel[], doSessionsExist: boolean, associatedUsers: UserModel[], associatedTargets: TargetModel[], totalItems: number}>}
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

      const searchOptions = {
        text: search,
        relatedSearches: [
          {
            resource: 'target',
            fields: ['name'],
            join: {
              joinFrom: 'target_id',
              joinOn: 'id',
            },
          },
          {
            resource: 'user',
            fields: ['name'],
            join: {
              joinFrom: 'user_id',
              joinOn: 'id',
            },
          },
        ],
      };

      const queryOptions = {
        scope_id,
        include_terminated: true,
        query: { search: searchOptions, filters, sort },
        page,
        pageSize,
      };

      // Preload the associated targets and users into the cache
      let refreshUsersPromise, refreshTargetsPromise;
      const canListTargets = this.can.can('list model', scope, {
        collection: 'targets',
      });
      if (canListTargets) {
        refreshTargetsPromise = this.store.query(
          'target',
          {
            scope_id: scope.id,
            page: 1,
            pageSize: 1,
          },
          { pushToStore: false },
        );
      }

      const orgScope = await this.store.findRecord('scope', scope.scope.id);
      const globalScope = await this.store.findRecord('scope', 'global');
      const canListUsers =
        this.can.can('list model', globalScope, { collection: 'users' }) ||
        this.can.can('list model', orgScope, { collection: 'users' });

      if (canListUsers) {
        refreshUsersPromise = this.store.query(
          'user',
          {
            scope_id: 'global',
            recursive: true,
            page: 1,
            pageSize: 1,
          },
          { pushToStore: false },
        );
      }

      const sessions = await this.store.query('session', queryOptions);
      const totalItems = sessions.meta?.totalItems;

      const doSessionsExist = await this.getDoSessionsExist(
        scope_id,
        totalItems,
      );

      const associatedTargetsPromise = this.store.query(
        'target',
        {
          query: {
            filters: {
              id: sessions.map((session) => ({
                equals: session.target_id,
              })),
            },
          },
        },
        { peekDb: true },
      );
      const associatedUsersPromise = this.store.query(
        'user',
        {
          query: {
            filters: {
              id: sessions.map((user) => ({
                equals: user.user_id,
              })),
            },
          },
        },
        { peekDb: true },
      );

      await Promise.all([
        refreshTargetsPromise,
        refreshUsersPromise,
        associatedTargetsPromise,
        associatedUsersPromise,
      ]);

      return {
        sessions,
        doSessionsExist,
        canListUsers,
        canListTargets,
        totalItems,
      };
    },
  );

  /**
   * Sets doSessionsExist to true if there are any sessions.
   * @param {string} scope_id
   * @param {number} totalItems
   * @returns {Promise<boolean>}
   */
  async getDoSessionsExist(scope_id, totalItems) {
    if (totalItems > 0) {
      return true;
    }
    const options = { pushToStore: false, peekDb: true };
    const sessions = await this.store.query(
      'session',
      {
        scope_id,
        include_terminated: true,
        query: { filters: { scope_id: [{ equals: scope_id }] } },
        page: 1,
        pageSize: 1,
      },
      options,
    );
    return sessions.length > 0;
  }

  // =actions

  /**
   * Loads initial filter options in controller so it happens outside of model hook
   * @param controller
   */
  setupController(controller) {
    super.setupController(...arguments);
    controller.loadItems.perform();
  }
}
