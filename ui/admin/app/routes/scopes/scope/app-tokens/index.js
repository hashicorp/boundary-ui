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
    sortBy: {
      refreshModel: true,
      replace: true,
    },
    sortOrder: {
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
      sortBy,
      sortOrder,
      useDebounce,
    }) => {
      if (useDebounce) {
        await timeout(250);
      }

      const parentModel = this.modelFor('scopes.scope.app-tokens');
      const scope = this.modelFor('scopes.scope');
      const { id: scope_id } = scope;
      let appTokens;
      let totalItems = 0;

      const filters = {
        scope_id: [{ equals: scope_id }],
        status: [],
      };

      // Add status filters if provided
      if (statuses && statuses.length > 0) {
        statuses.forEach((status) => {
          filters.status.push({ equals: status });
        });
      }

      // Build sort
      const sort = sortBy
        ? {
            attributes: [sortBy],
            direction: sortOrder || 'asc',
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
          page: page || 1,
          pageSize: pageSize || 10,
        };

        // Remove undefined values from query
        if (!queryOptions.query.search) delete queryOptions.query.search;
        if (!queryOptions.query.sort) delete queryOptions.query.sort;

        appTokens = await this.store.query('app-token', queryOptions);
        totalItems = appTokens.meta?.totalItems || appTokens.length;

        return {
          ...parentModel,
          scope,
          appTokens,
          totalItems,
        };
      }

      return {
        ...parentModel,
        scope,
        appTokens: [],
        totalItems: 0,
      };
    },
  );
}
