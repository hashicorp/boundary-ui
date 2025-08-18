/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { restartableTask, timeout } from 'ember-concurrency';

export default class ScopesScopeUsersIndexRoute extends Route {
  // =attributes

  queryParams = {
    search: {
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

  // =services

  @service store;
  @service can;

  // =methods

  /**
   * Loads queried users and the number of users under current scope.
   * @returns {Promise<{totalItems: number, users: [UserModel], doUsersExist: boolean }> }
   */
  async model(params) {
    const useDebounce =
      this.retrieveData?.lastPerformed?.args?.[0].search !== params.search;
    return this.retrieveData.perform({ ...params, useDebounce });
  }

  retrieveData = restartableTask(
    async ({
      search,
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
      };

      const sort =
        sortAttribute === 'name'
          ? {
              attributes: [sortAttribute, 'id'],
              direction: sortDirection,
              isCoalesced: true,
            }
          : { attributes: [sortAttribute], direction: sortDirection };

      let users;
      let totalItems = 0;
      let doUsersExist = false;
      if (this.can.can('list model', scope, { collection: 'users' })) {
        users = await this.store.query('user', {
          scope_id,
          query: { search, filters, sort },
          page,
          pageSize,
        });
        totalItems = users.meta?.totalItems;
        doUsersExist = await this.getDoUsersExist(scope_id, totalItems);
      }

      return { users, doUsersExist, totalItems };
    },
  );

  /**
   * Sets doUsersExist to true if there exists any users.
   * @param {string} scope_id
   * @param {number} totalItems
   * @returns {Promise<boolean>}
   */
  async getDoUsersExist(scope_id, totalItems) {
    if (totalItems > 0) {
      return true;
    }
    const options = { pushToStore: false, peekDb: true };
    const user = await this.store.query(
      'user',
      {
        scope_id,
        query: {
          filters: {
            scope_id: [{ equals: scope_id }],
          },
        },
        page: 1,
        pageSize: 1,
      },
      options,
    );
    return user.length > 0;
  }

  setupController(controller) {
    const scope = this.modelFor('scopes.scope');
    super.setupController(...arguments);
    controller.setProperties({ scope });
  }
}
