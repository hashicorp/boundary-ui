/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { restartableTask, timeout } from 'ember-concurrency';

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
  @service intl;
  @service confirm;

  // =methods

  /**
   * Loads projects for current org scope.
   * @return {Promise<{role: RoleModel, orgScope: ScopeModel, projectScopes: [ScopeModel], totalItems: number, totalItemsCount: number, remainingProjectIDs: [string]}> }
   */
  async model(params) {
    const useDebounce =
      this.retrieveData?.lastPerformed?.args?.[0].search !== params.search;
    return this.retrieveData.perform({ ...params, useDebounce });
  }

  retrieveData = restartableTask(
    async ({ org_id, search, page, pageSize, useDebounce }) => {
      if (useDebounce) {
        await timeout(250);
      }

      const role = this.modelFor('scopes.scope.roles.role');
      const orgScope = this.store.peekRecord('scope', org_id);
      const filters = {
        scope_id: [{ equals: org_id }],
      };

      const projectScopes = await this.store.query('scope', {
        scope_id: role.scope.id,
        query: { search, filters },
        page,
        pageSize,
        recursive: true,
      });
      const totalItems = projectScopes.meta?.totalItems;
      const totalItemsCount = await this.getTotalItemsCount(
        org_id,
        search,
        totalItems,
      );

      const remainingProjectIDs = await this.getRemainingProjects(role, org_id);

      return {
        role,
        orgScope,
        projectScopes,
        totalItems,
        totalItemsCount,
        remainingProjectIDs,
      };
    },
  );

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
    return scopes.meta?.totalItems;
  }

  /**
   * Extract project type grant scope ids that don't belong to this org scope.
   * @param {RoleModel} role
   * @param {string} org_id
   * @returns {Promise<[string]>} remainingProjectIDs
   */
  async getRemainingProjects(role, org_id) {
    let selectedProjectIDs = role.grantScopeProjectIDs;
    let remainingProjectIDs = [];
    if (role.scope.isGlobal && selectedProjectIDs.length) {
      const id = [];
      selectedProjectIDs.forEach((projectID) => id.push({ equals: projectID }));
      const options = { pushToStore: false, peekDb: true };
      const projects = await this.store.query(
        'scope',
        { scope_id: 'global', query: { filters: { id } } },
        options,
      );
      projects.forEach((project) => {
        if (project.scope.id !== org_id) {
          remainingProjectIDs.push(project.id);
        }
      });
    }
    return remainingProjectIDs;
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
