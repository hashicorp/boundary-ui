/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { restartableTask, timeout } from 'ember-concurrency';

export default class ScopesScopeAppTokensIndexRoute extends Route {
  // =services
  @service store;
  @service can;

  // =attributes

  queryParams = {
    search: {
      refreshModel: true,
      replace: true,
    },
    statuses: {
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

  /**
   * Load all app tokens for the scope.
   * @return {Promise<{ totalItems: number, appTokens: [AppTokenModel], scope: ScopeModel }>}
   */
  async model(params) {
    const useDebounce =
      this.retrieveData?.lastPerformed?.args?.[0].search !== params.search;
    return this.retrieveData.perform({ ...params, useDebounce });
  }

  retrieveData = restartableTask(
    async ({
      search,
      statuses,
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

      let appTokens = [];
      let totalItems = 0;
      let doAppTokensExist = false;

      const filters = {
        scope_id: [{ equals: scope_id }],
        status: [],
      };

      // Add status filters
      if (statuses && statuses.length > 0) {
        statuses.forEach((status) => {
          filters.status.push({ equals: status });
        });
      }

      // Build sort
      const sort = sortAttribute
        ? {
            attributes: [sortAttribute],
            direction: sortDirection || 'asc',
          }
        : undefined;

      if (this.can.can('list scope', scope, { collection: 'app-tokens' })) {
        const queryOptions = {
          scope_id,
          query: {
            search: search
              ? { text: search, fields: ['name', 'description', 'id'] }
              : undefined,
            filters,
            sort,
          },
          page,
          pageSize,
        };

        appTokens = await this.store.query('app-token', queryOptions);
        totalItems = appTokens.meta?.totalItems || appTokens.length;

        doAppTokensExist = await this.getDoAppTokensExist(scope_id, totalItems);
      }

      return {
        scope,
        appTokens,
        totalItems,
        doAppTokensExist,
      };
    },
  );

  /**
   * Sets doAppTokensExist to true if there are any app tokens.
   * @param {string} scope_id
   * @param {number} totalItems
   * @returns {Promise<boolean>}
   */
  async getDoAppTokensExist(scope_id, totalItems) {
    if (totalItems > 0) {
      return true;
    }
    const options = { pushToStore: false, peekDb: true };
    const appTokens = await this.store.query(
      'app-token',
      {
        scope_id,
        page: 1,
        pageSize: 1,
      },
      options,
    );
    return appTokens.length > 0;
  }
}
