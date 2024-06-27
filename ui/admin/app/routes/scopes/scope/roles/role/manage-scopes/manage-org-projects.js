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
   * @return {Promise<{role: RoleModel, orgScope: ScopeModel, projectScopes: [ScopeModel], totalItems: number, totalItemsCount: number, selectedProjectIDs: [string], remainingProjectIDs: [string]}> }
   */
  async model({ org_id, search, page, pageSize }) {
    const role = this.modelFor('scopes.scope.roles.role');
    const orgScope = this.store.peekRecord('scope', org_id);
    const filters = {
      scope_id: [{ equals: org_id }],
    };

    const projectScopes = await this.store.query('scope', {
      scope_id: org_id,
      query: { search, filters },
      page,
      pageSize,
    });
    const totalItems = projectScopes.meta?.totalItems;
    const totalItemsCount = await this.getTotalItemsCount(
      org_id,
      search,
      totalItems,
    );

    const { selectedProjectIDs, remainingProjectIDs } =
      await this.getSelectedProjects(role, org_id);

    return {
      role,
      orgScope,
      projectScopes,
      totalItems,
      totalItemsCount,
      selectedProjectIDs,
      remainingProjectIDs,
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

  /**
   * Extract project type grant scope ids that belong to this org scope.
   * @param {RoleModel} role
   * @param {string} org_id
   * @returns {object}
   */
  async getSelectedProjects(role, org_id) {
    let selectedProjectIDs = role.grantScopeProjectIDs;
    let remainingProjectIDs = [];
    if (role.scope.isGlobal) {
      const id = [];
      selectedProjectIDs.forEach((projectID) => id.push({ equals: projectID }));
      const options = { pushToStore: false, peekIndexedDB: true };
      const projects = await this.store.query(
        'scope',
        { scope_id: 'global', query: { filters: { id } } },
        options,
      );
      selectedProjectIDs = projects.reduce((selectedIDs, project) => {
        if (project.scope.id === org_id) {
          selectedIDs.push(project.id);
        } else {
          remainingProjectIDs.push(project.id);
        }
        return selectedIDs;
      }, []);
    }
    return { selectedProjectIDs, remainingProjectIDs };
  }
}
