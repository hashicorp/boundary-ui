/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { TrackedObject } from 'tracked-built-ins';
import { TYPE_SCOPE_PROJECT } from 'api/models/scope';
import { restartableTask, timeout } from 'ember-concurrency';
import { GRANT_SCOPE_CHILDREN } from 'api/models/role';

export default class ScopesScopeWorkersNewRoute extends Route {
  // =services

  @service store;
  @service can;
  @service router;

  // =attributes

  queryParams = {
    search: {
      refreshModel: true,
      replace: true,
    },
    type: {
      refreshModel: true,
      replace: true,
    },
    parent_scope: {
      refreshModel: true,
      replace: true,
    },
    page: {
      refreshModel: true,
    },
    pageSize: {
      refreshModel: true,
    },
    showBSide: {
      replace: false,
    },
  };

  // =methods

  /**
   * Redirect to parent route when scope does not have create authorized action.
   */
  beforeModel() {
    const scopeModel = this.modelFor('scopes.scope');
    if (
      this.can.cannot('create worker led worker', scopeModel, {
        collection: 'workers',
      })
    ) {
      this.router.replaceWith('scopes.scope.workers');
    }
  }

  /**
   * Creates a new unsaved worker.
   * @return {WorkerModel}
   */
  async model(params) {
    // const scopeModel = this.modelFor('scopes.scope');
    // const record = this.store.createRecord('worker');
    // record.scopeModel = scopeModel;
    // return record;

    const useDebounce =
      this.retrieveData?.lastPerformed?.args?.[0].search !== params.search;
    return this.retrieveData.perform({ ...params, useDebounce });
  }

  retrieveData = restartableTask(
    async ({ search, orgs, page, pageSize, useDebounce }) => {
      if (useDebounce) {
        await timeout(250);
      }

      // const role = this.modelFor('scopes.scope.roles.role');
      // console.log(role);
      // const canSelectOrgs =
      //   !role.grant_scope_ids.includes(GRANT_SCOPE_CHILDREN);

      let filters;
      // filters = { scope_id: [{ equals: 'global' }] };
      // if (canSelectOrgs) {
      //   filters = { scope_id: [{ equals: 'global' }] };
      // } else {
      //   filters = { type: [{ equals: TYPE_SCOPE_PROJECT }], scope_id: [] };
      //   orgs.forEach((org) => {
      //     filters.scope_id.push({ equals: org });
      //   });
      // }
      const scopes = await this.store.query('scope', {
        scope_id: 'global',
        query: { search, filters },
        page,
        pageSize,
        recursive: true,
      });
      console.log(scopes);
      const sortedScopes = scopes.sort((a, b) => {
        if (a.isOrg && !b.isOrg) return -1;
        if (!a.isOrg && b.isOrg) return 1;
        if (a.isProject && !b.isProject) return -1;
        if (!a.isProject && b.isProject) return 1;
        return 0;
      });

      // let projectTotals;
      let allProjects;
      // if (canSelectOrgs) {
      //   projectTotals = await this.getProjectTotals(role.grantScopeProjectIDs);
      // } else {
      //   allProjects = await this.getAllProjects();
      // }
      allProjects = await this.getAllProjects();
      console.log('allProjects', allProjects);

      const totalItems = scopes.meta?.totalItems;
      const totalItemsCount = await this.getTotalItemsCount(
        search,
        totalItems,
        // canSelectOrgs,
      );

      const scopeModel = this.modelFor('scopes.scope');
      const worker = this.store.createRecord('worker');
      worker.scopeModel = scopeModel;
      return {
        // role,
        scopes: sortedScopes,
        // projectTotals,
        allProjects,
        totalItems,
        totalItemsCount,
        // canSelectOrgs,
        worker,
      };
    },
  );

  /**
   * Retrieves
   * @returns {Promise<[ScopeModel]>}
   */
  async getAllProjects() {
    const options = { pushToStore: false, peekDb: true };
    return this.store.query(
      'scope',
      {
        scope_id: 'global',
        query: { filters: { type: [{ equals: TYPE_SCOPE_PROJECT }] } },
      },
      options,
    );
  }

  // /**
  //  * Creates an object that contains the number of selected projects
  //  * and the total number of projects for each org scope.
  //  * @param {[string]} projectIDs
  //  * @returns {object}
  //  */
  // async getProjectTotals(projectIDs) {
  //   const projects = await this.getAllProjects();

  //   // We want this object to be tracked so that changes to this object
  //   // cause the "Projects selected" column to re-render with updates.
  //   const projectTotals = new TrackedObject({});
  //   projects.forEach(({ id, scope }) => {
  //     if (!projectTotals[scope.id]) {
  //       projectTotals[scope.id] = { selected: [], total: 0 };
  //     }
  //     if (projectIDs.includes(id)) {
  //       projectTotals[scope.id].selected.push(id);
  //     }
  //     projectTotals[scope.id].total++;
  //   });

  //   return projectTotals;
  // }

  /**
   * Sets scopesExist to true if there exists any scopes and
   * sets totalItemsCount to the number of scopes that exist.
   * @param {string} search
   * @param {number} totalItems
   * @param {boolean} canSelectOrgs
   * @returns {Promise<number>}
   */
  // async getTotalItemsCount(search, totalItems, canSelectOrgs) {
  async getTotalItemsCount(search, totalItems) {
    if (!search) {
      return totalItems;
    }
    const options = { pushToStore: false, peekDb: true };
    const filters = { type: [{ equals: 'global' }] };
    // const filters = canSelectOrgs
    //   ? { scope_id: [{ equals: 'global' }] }
    //   : { type: [{ equals: TYPE_SCOPE_PROJECT }] };
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
  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('search', '');
      controller.set('page', 1);
    }
  }
}
