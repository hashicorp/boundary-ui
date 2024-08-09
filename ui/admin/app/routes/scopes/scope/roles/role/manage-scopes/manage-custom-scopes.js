/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { TYPE_SCOPE_PROJECT } from 'api/models/scope';
import { TrackedObject } from 'tracked-built-ins';
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
  @service intl;
  @service confirm;

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

    const orgScopes = await this.store.query('scope', {
      scope_id,
      query: { search, filters },
      page,
      pageSize,
      recursive: true,
    });
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

    // We want this object to be tracked so that changes to this object
    // cause the "Projects selected" column to re-render with updates.
    const projectTotals = new TrackedObject({});
    projects.forEach(({ id, scope }) => {
      if (!projectTotals[scope.id]) {
        projectTotals[scope.id] = { selected: [], total: 0 };
      }
      if (projectIDs.includes(id)) {
        projectTotals[scope.id].selected.push(id);
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

  // =actions

  /**
   * Stores the role model in the transition data property so that the application level hook
   * can check for dirty attributes and trigger the confirm service.
   * @param {object} transition
   */
  @action
  async willTransition(transition) {
    const { role } = transition.from.attributes;
    transition.data = { model: role };
  }
}
