/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { TrackedObject } from 'tracked-built-ins';
import { TYPE_SCOPE_PROJECT } from 'api/models/scope';
import { restartableTask, timeout } from 'ember-concurrency';
import { GRANT_SCOPE_CHILDREN } from 'api/models/role';

export default class ScopesScopeRolesRoleManageScopesManageCustomScopesRoute extends Route {
  // =attributes

  queryParams = {
    search: {
      refreshModel: true,
      replace: true,
    },
    orgs: {
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
   * @returns {Promise<{role: RoleModel, orgScopes: [ScopeModel], projectTotals: object, totalItems: number, totalItemsCount: number, canSelectOrgs: boolean}> }
   */
  async model(params) {
    const useDebounce =
      this.retrieveData?.lastPerformed?.args?.[0].search !== params.search;
    return this.retrieveData.perform({ ...params, useDebounce });
  }

  retrieveData = restartableTask(
    async ({ search, orgs, page, pageSize, useDebounce }) => {
      if (useDebounce) {
        await timeout(250);
      }

      const role = this.modelFor('scopes.scope.roles.role');
      const canSelectOrgs =
        !role.grant_scope_ids.includes(GRANT_SCOPE_CHILDREN);
      const filters = canSelectOrgs
        ? { scope_id: [{ equals: 'global' }] }
        : { type: [{ equals: TYPE_SCOPE_PROJECT }] };

      let projectTotals;
      let allProjects;
      if (canSelectOrgs) {
        projectTotals = await this.getProjectTotals(role.grantScopeProjectIDs);
      } else {
        filters.scope_id = [];
        orgs.forEach((org) => {
          filters.scope_id.push({ equals: org });
        });
        allProjects = await this.getAllProjects();
      }

      const scopes = await this.store.query('scope', {
        scope_id: 'global',
        query: { search, filters },
        page,
        pageSize,
        recursive: true,
      });
      const totalItems = scopes.meta?.totalItems;
      const totalItemsCount = await this.getTotalItemsCount(
        search,
        totalItems,
        canSelectOrgs,
      );

      return {
        role,
        scopes,
        projectTotals,
        allProjects,
        totalItems,
        totalItemsCount,
        canSelectOrgs,
      };
    },
  );

  /**
   * Retrieves
   * @returns {Promise<[ScopeModel]>}
   */
  async getAllProjects() {
    const options = { pushToStore: false, peekIndexedDB: true };
    return this.store.query(
      'scope',
      {
        scope_id: 'global',
        query: { filters: { type: [{ equals: TYPE_SCOPE_PROJECT }] } },
      },
      options,
    );
  }

  /**
   * Creates an object that contains the number of selected projects
   * and the total number of projects for each org scope.
   * @param {[string]} projectIDs
   * @returns {object}
   */
  async getProjectTotals(projectIDs) {
    const projects = await this.getAllProjects();

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
   * @param {string} search
   * @param {number} totalItems
   * @returns {Promise<number>}
   */
  async getTotalItemsCount(search, totalItems, canSelectOrgs) {
    if (!search) {
      return totalItems;
    }
    const options = { pushToStore: false, peekIndexedDB: true };
    const filters = canSelectOrgs
      ? { scope_id: [{ equals: 'global' }] }
      : { type: [{ equals: TYPE_SCOPE_PROJECT }] };
    const scopes = await this.store.query(
      'scope',
      {
        scope_id: 'global',
        query: { filters },
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
