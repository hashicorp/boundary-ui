/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { restartableTask, timeout } from 'ember-concurrency';
import { sortNameWithIdFallback } from 'admin/utils/sort-name-with-id-fallback';

export default class ScopesScopeScopesIndexRoute extends Route {
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

  @service can;
  @service store;

  // =methods

  /**
   * Loads sub scopes for the current scope.
   * @returns {Promise<{totalItems: number, currentScope: ScopeModel, subScopes: [ScopeModel], doScopesExist: boolean }> }
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

      const currentScope = this.modelFor('scopes.scope');
      const { id: scope_id } = currentScope;
      const filters = {
        scope_id: [{ equals: scope_id }],
      };

      const sort =
        sortAttribute === 'name'
          ? { sortFunction: sortNameWithIdFallback, direction: sortDirection }
          : { attribute: sortAttribute, direction: sortDirection };

      const subScopes = await this.store.query('scope', {
        scope_id,
        query: { search, filters, sort },
        page,
        pageSize,
      });
      const totalItems = subScopes.meta?.totalItems;
      const doScopesExist = await this.getDoScopesExist(scope_id, totalItems);

      return {
        currentScope,
        subScopes,
        doScopesExist,
        totalItems,
      };
    },
  );

  /**
   * Sets doScopesExist to true if there exists any scopes.
   * @param {string} scope_id
   * @param {number} totalItems
   * @returns {Promise<boolean>}
   */
  async getDoScopesExist(scope_id, totalItems) {
    if (totalItems > 0) {
      return true;
    }
    const options = { pushToStore: false, peekDb: true };
    const scopes = await this.store.query(
      'scope',
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
    return scopes.length > 0;
  }
}
