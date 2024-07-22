/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { TYPE_SCOPE_PROJECT } from 'api/models/scope';

export default class ScopesScopeRolesRoleManageScopesManageCustomScopesRoute extends Route {
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
   * Loads sub scopes for the current scope.
   * @returns {Promise<{role: RoleModel, orgScopes: [ScopeModel], projectTotals: object, totalItems: number, totalItemsCount: number}> }
   */
  async model({ search, page, pageSize }) {
    const role = this.modelFor('scopes.scope.roles.role');
    const currentScope = this.modelFor('scopes.scope');
    const { id: scope_id } = currentScope;
    const filters = {
      scope_id: [{ equals: scope_id }],
    };

    // All scopes have already been pre-loaded in the `scopes.scopes.roles.role` route.
    // Therefore, we can simply peek into indexedDB to retrieve results.
    const options = { peekIndexedDB: true };
    const orgScopes = await this.store.query(
      'scope',
      {
        scope_id,
        query: { search, filters },
        page,
        pageSize,
      },
      options,
    );
    const totalItems = orgScopes.meta?.totalItems;
    const totalItemsCount = await this.getTotalItemsCount(
      scope_id,
      search,
      totalItems,
    );

    const projectTotals = await this.getProjectTotals(
      role.grantScopeProjectIDs,
    );

    return {
      role,
      orgScopes,
      projectTotals,
      totalItems,
      totalItemsCount,
    };
  }

  /**
   * Creates an object that contains the number of selected projects
   * and the total number of projects for each org scope.
   * @param {[string]} projectIDs
   * @returns {object}
   */
  async getProjectTotals(projectIDs) {
    const options = { pushToStore: false, peekIndexedDB: true };
    const projects = await this.store.query(
      'scope',
      {
        scope_id: 'global',
        query: { filters: { type: [{ equals: TYPE_SCOPE_PROJECT }] } },
      },
      options,
    );

    const projectTotals = {};
    projects.forEach(({ id, scope }) => {
      if (!projectTotals[scope.id]) {
        projectTotals[scope.id] = { selected: 0, total: 0 };
      }
      if (projectIDs.includes(id)) {
        projectTotals[scope.id].selected++;
      }
      projectTotals[scope.id].total++;
    });

    return projectTotals;
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
