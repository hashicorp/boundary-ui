/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import {
  STATUS_SESSION_ACTIVE,
  STATUS_SESSION_PENDING,
} from 'api/models/session';
import { action } from '@ember/object';

export default class ScopesScopeProjectsTargetsIndexRoute extends Route {
  // =services

  @service can;
  @service clusterUrl;
  @service resourceFilterStore;
  @service router;
  @service session;
  @service store;

  // =attributes

  queryParams = {
    search: {
      refreshModel: true,
      replace: true,
    },
    scopes: {
      refreshModel: true,
      replace: true,
    },
    availableSessions: {
      refreshModel: true,
      replace: true,
    },
    types: {
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

  allTargets;

  // =methods

  /**
   * Event to determine whether the loading template should be shown.
   * Only show the loading template during initial loads or when transitioning
   * from different routes. Don't show it when a user is just searching or
   * filtering on the same page as it can be jarring.
   * @param transition
   * @returns {boolean}
   */
  @action
  loading(transition) {
    const from = transition.from?.name;
    return from !== 'scopes.scope.projects.targets.index';
  }

  /**
   * If arriving here unauthenticated, redirect to index for further processing.
   */
  beforeModel() {
    if (!this.session.isAuthenticated) this.router.transitionTo('index');
  }

  /**
   * Loads queried targets, the number of targets under current scope, and
   * projects for filtering options.
   *
   * @returns {Promise<{totalItems: number, targets: [TargetModel], projects: [ScopeModel], allTargets: [TargetModel] }> }
   */
  async model(
    { search, scopes, availableSessions, types, page, pageSize },
    transition,
  ) {
    await this.getAllTargets(transition);
    const projects = this.modelFor('scopes.scope.projects');
    const projectIds = projects.map((project) => project.id);

    const filters = { scope_id: [], id: { values: [] }, type: [] };
    scopes.forEach((scope) => {
      filters.scope_id.push({ equals: scope });
    });
    if (scopes.length === 0) {
      projectIds.forEach((projectId) => {
        filters.scope_id.push({ equals: projectId });
      });
    }
    types.forEach((type) => {
      filters.type.push({ equals: type });
    });

    // Retrieve all sessions so that the session and activeSessions getters
    // in the target model always retrieve the most up-to-date sessions.
    const sessions = await this.store.query('session', {
      query: {
        filters: {
          user_id: [{ equals: this.session.data.authenticated.user_id }],
          status: [
            { equals: STATUS_SESSION_ACTIVE },
            { equals: STATUS_SESSION_PENDING },
          ],
        },
      },
      force_refresh: true,
    });

    this.addActiveSessionFilters(filters, availableSessions, sessions);

    let targets = await this.store.query('target', {
      query: { search, filters },
      page,
      pageSize,
      force_refresh: true,
    });
    const totalItems = targets.meta?.totalItems;

    // TODO: Filter targets by scope we're in manually
    // const { id: scope_id } = this.modelFor('scopes.scope');
    // Filter out targets to which users do not have the connect ability
    targets = targets.filter((target) =>
      this.can.can('connect target', target),
    );

    return {
      targets,
      projects,
      allTargets: this.allTargets,
      totalItems,
    };
  }

  resetController(controller, isExiting, transition) {
    const { to } = transition;
    if (!isExiting && to.queryParams.scopes === '[]') {
      controller.setProperties({
        scopes: [],
      });
    }
  }

  /**
   * Get all the targets but only load them once when entering the route. Ideally we would lazy load it when needed
   * but this can be revisited in the future.
   * @param transition
   * @returns {Promise<void>}
   */
  async getAllTargets(transition) {
    const from = transition.from?.name;

    // Query all targets for defining filtering values if entering route for first time
    if (from !== 'scopes.scope.projects.targets.index') {
      const options = { pushToStore: false };
      const allTargets = await this.store.query('target', {}, options);

      // Filter out targets to which users do not have the connect ability
      this.allTargets = allTargets.filter((target) =>
        target.authorized_actions.includes('authorize-session'),
      );
    }
  }

  /**
   * Add the filters for active sessions to the filter object.
   * @param filters
   * @param availableSessions
   * @param sessions
   */
  addActiveSessionFilters = (filters, availableSessions, sessions) => {
    const uniqueTargetIdsWithSessions = new Set(
      sessions.map((session) => session.target_id),
    );

    // Don't add any filtering if the user selects both which is equivalent to no filters
    if (availableSessions.length === 2) {
      return;
    }

    availableSessions.forEach((availability) => {
      if (availability === 'yes') {
        filters.id.logicalOperator = 'or';
        uniqueTargetIdsWithSessions.forEach((targetId) => {
          filters.id.values.push({ equals: targetId });
        });

        // If there's no sessions just set it to a dummy value
        // so the search returns no results
        if (uniqueTargetIdsWithSessions.size === 0) {
          filters.id.values.push({ equals: 'none' });
        }
      }

      if (availability === 'no') {
        filters.id.logicalOperator = 'and';

        uniqueTargetIdsWithSessions.forEach((targetId) => {
          filters.id.values.push({ notEquals: targetId });
        });
      }
    });
  };
}
