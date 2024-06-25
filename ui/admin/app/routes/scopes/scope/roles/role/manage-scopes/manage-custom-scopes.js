/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

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
   * @returns {Promise<{role: RoleModel, subScopes: [ScopeModel], totalItems: number, totalItemsCount: number}> }
   */
  async model({ search, page, pageSize }) {
    const role = this.modelFor('scopes.scope.roles.role');
    const currentScope = this.modelFor('scopes.scope');
    const { id: scope_id } = currentScope;
    const filters = {
      scope_id: [{ equals: scope_id }],
    };

    const subScopes = await this.store.query('scope', {
      scope_id,
      query: { search, filters },
      page,
      pageSize,
    });
    const totalItems = subScopes.meta?.totalItems;
    const totalItemsCount = await this.getTotalItemsCount(
      scope_id,
      search,
      totalItems,
    );

    const projectsSelected = await this.getProjectsSelected(
      role.grantScopeProjectIDs,
      subScopes,
    );

    return {
      role,
      subScopes,
      projectsSelected,
      totalItems,
      totalItemsCount,
    };
  }

  async getProjectsSelected(projectIDs, orgScopes) {
    const options = { pushToStore: false, peekIndexedDB: true };
    const projectsSelected = {};

    const projectScopes = await Promise.all(
      orgScopes.map(({ id: scope_id }) =>
        this.store.query(
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
        ),
      ),
    );

    projectScopes.forEach((items) => {
      if (items.length)
        projectsSelected[items[0].scope.id] = {
          selected: 0,
          total: items.meta?.totalItems,
        };
    });

    if (projectIDs.length) {
      const id = [];
      projectIDs.forEach((proj_id) => id.push({ equals: proj_id }));

      const selectedProjects = await Promise.all(
        orgScopes.map(({ id: scope_id }) =>
          this.store.query(
            'scope',
            {
              scope_id,
              query: {
                filters: {
                  scope_id: [{ equals: scope_id }],
                  id,
                },
              },
              page: 1,
              pageSize: 1,
            },
            options,
          ),
        ),
      );
      selectedProjects.forEach((items) => {
        if (items.length)
          projectsSelected[items[0].scope.id].selected = items.meta?.totalItems;
      });
    }

    return projectsSelected;
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
