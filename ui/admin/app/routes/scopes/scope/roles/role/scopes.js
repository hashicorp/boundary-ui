/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

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

  async model({ search, parentScopes, types, page, pageSize }) {
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
        if (keyword.includes(search)) {
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
        scope_id: 'global',
        query: { search, filters },
        page,
        pageSize: pageSize - totalItems,
      });
      grantScopes =
        page === 1 ? [...grantScopes, ...queriedScopes] : queriedScopes;
      totalItems += queriedScopes.meta?.totalItems;
    }
    return { role, grantScopes, allGrantScopes, totalItems };
  }

  /**
   * Get all the grant scopes but only load them once when entering the route.
   * @param orgScope
   * @param orgFilter
   * @returns {Promise<void>}
   */
  async getAllGrantScopes(id) {
    const options = { pushToStore: false, peekIndexedDb: true };
    return this.store.query(
      'scope',
      { scope_id: 'global', query: { filters: { id } } },
      options,
    );
  }
}
