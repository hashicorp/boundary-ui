/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ScopesScopeRolesRoleManageScopesManageOrgProjectsRoute extends Route {
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
  };

  // =services

  @service store;

  // =methods

  /**
   * Loads projects for current org scope.
   * @return {Promise<{role: RoleModel, orgScope: [ScopeModel], subScopes: [ScopeModel], totalItems: number, totalItemsCount: number}> }
   */
  async model({ org_id, search, page, pageSize }) {
    const role = this.modelFor('scopes.scope.roles.role');
    const orgScope = this.store.peekRecord('scope', org_id);

    const filters = {
      scope_id: [{ equals: org_id }],
    };

    const subScopes = await this.store.query('scope', {
      scope_id: org_id,
      query: { search, filters },
      page,
      pageSize,
    });
    const totalItems = subScopes.meta?.totalItems;
    const totalItemsCount = await this.getTotalItemsCount(
      org_id,
      search,
      totalItems,
    );

    return {
      role,
      orgScope,
      subScopes,
      totalItems,
      totalItemsCount,
    };
  }

  /**
   * Sets scopesExist to true if there exists any scopes and
   * sets totalItemsCount to the number of scopes that exist.
   * @param {string} scope_id
   * @param {string} search
   * @param {number} totalItems
   * @returns {Promise<number>}
   */
  async getTotalItemsCount(scope_id, search, totalItems) {
    if (!search) {
      return totalItems;
    }
    const options = { pushToStore: false, peekIndexedDB: true };
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
    return scopes.meta?.totalItems;
  }
}
