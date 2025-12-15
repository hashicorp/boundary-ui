/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { restartableTask, timeout } from 'ember-concurrency';

export default class ScopesScopeRolesRoleScopesRoute extends Route {
  // =services

  @service store;

  // =attributes

  queryParams = {
    search: {
      refreshModel: true,
      replace: true,
    },
    parentScopes: {
      refreshModel: true,
      replace: true,
    },
    types: {
      refreshModel: true,
      replace: true,
    },
    page: {
      refreshModel: true,
    },
    pageSize: {
      refreshModel: true,
    },
  };

  // =methods

  /**
   * Loads grant scopes for current role.
   * @return {Promise<{role: RoleModel, grantScopes: [ScopeModel], allGrantScopes: [ScopeModel], totalItems: number}> }
   */
  async model(params) {
    const useDebounce =
      this.retrieveData?.lastPerformed?.args?.[0].search !== params.search;
    return this.retrieveData.perform({ ...params, useDebounce });
  }

  retrieveData = restartableTask(
    async ({ search, parentScopes, types, page, pageSize, useDebounce }) => {
      if (useDebounce) {
        await timeout(250);
      }

      const role = this.modelFor('scopes.scope.roles.role');
      const filters = {
        scope_id: [],
        type: [],
        id: [],
      };
      role.grant_scope_ids.forEach((id) => {
        if (id.startsWith('p_') || id.startsWith('o_')) {
          filters.id.push({ equals: id });
        }
      });

      let grantScopes = [];
      if (!parentScopes.length && !types.length) {
        role.grantScopeKeywords.forEach((keyword) => {
          if (keyword.includes(search) || !search) {
            grantScopes.push({ id: keyword });
          }
        });
      }

      let allGrantScopes = [];
      let totalItems = grantScopes.length;
      if (filters.id.length) {
        parentScopes.forEach((id) => filters.scope_id.push({ equals: id }));
        types.forEach((type) => filters.type.push({ equals: type }));

        allGrantScopes = await this.getAllGrantScopes(filters.id);

        const queriedScopes = await this.store.query('scope', {
          scope_id: role.scope.id,
          query: { search, filters },
          page,
          pageSize: pageSize - totalItems,
          recursive: true,
        });
        grantScopes =
          page === 1 ? [...grantScopes, ...queriedScopes] : queriedScopes;
        totalItems += queriedScopes.meta?.totalItems;
      }
      return { role, grantScopes, allGrantScopes, totalItems };
    },
  );

  /**
   * Get all the grant scopes but only load them once when entering the route.
   * @param {[object]} id
   * @returns {Promise<[ScopeModel]>}
   */
  async getAllGrantScopes(id) {
    const options = { pushToStore: false, peekDb: true };
    return this.store.query(
      'scope',
      { scope_id: 'global', query: { filters: { id } } },
      options,
    );
  }
}
