/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import isEqual from 'lodash/isEqual';
import { TrackedArray } from 'tracked-built-ins';
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
  @service confirm;
  @service intl;

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
        new TrackedArray(model.role.grantScopeOrgIDs),
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
    const role = this.modelFor('scopes.scope.roles.role');
    const { from, to } = transition;
    if (
      !isEqual(controller.get('selectedItems'), role.grantScopeOrgIDs) &&
      from?.name !== to?.name
    ) {
      transition.abort();
      try {
        await this.confirm.confirm(this.intl.t('questions.abandon-confirm'), {
          title: 'titles.abandon-confirm',
          confirm: 'actions.discard',
        });
        controller.set(
          'selectedItems',
          new TrackedArray(role.grantScopeOrgIDs),
        );
        transition.retry();
      } catch (e) {
        // if user denies, do nothing
      }
    }
  }
}
