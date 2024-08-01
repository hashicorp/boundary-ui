/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import isEqual from 'lodash/isEqual';
import { TrackedArray } from 'tracked-built-ins';

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
   * @return {Promise<{role: RoleModel, orgScope: ScopeModel, projectScopes: [ScopeModel], totalItems: number, totalItemsCount: number, selectedProjectIDs: [string], remainingProjectIDs: [string]}> }
   */
  async model({ org_id, search, page, pageSize }) {
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
    if (role.scope.isGlobal && selectedProjectIDs.length) {
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

  /**
   * Sets selectedItems to correct value only when entering route for the first time and on page refresh.
   * @param {Controller} controller
   * @param {object} model
   * @param {object} transition
   */
  setupController(controller, model, transition) {
    const { from, to } = transition;
    if (from?.name !== to?.name) {
      controller.set(
        'selectedItems',
        new TrackedArray(model.selectedProjectIDs),
      );
    }
  }

  /**
   * Sets selectedItems to empty array when exiting this route.
   * @param {Controller} controller
   * @param {boolean} isExiting
   */
  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('selectedItems', new TrackedArray([]));
    }
  }

  // =actions

  /**
   * Triggers confirm pop-up only when user has made changes and is trying to navigate away from current route.
   * @param {object} transition
   */
  @action
  async willTransition(transition) {
    // eslint-disable-next-line ember/no-controller-access-in-routes
    const controller = this.controllerFor(this.routeName);
    const { selectedProjectIDs } = this.modelFor(this.routeName);
    const { from, to } = transition;
    if (
      !isEqual(controller.get('selectedItems'), selectedProjectIDs) &&
      from?.name !== to?.name
    ) {
      transition.abort();
      try {
        await this.confirm.confirm(this.intl.t('questions.abandon-confirm'), {
          title: 'titles.abandon-confirm',
          confirm: 'actions.discard',
        });
        controller.set('selectedItems', new TrackedArray(selectedProjectIDs));
        transition.retry();
      } catch (e) {
        // if user denies, do nothing
      }
    }
  }
}
