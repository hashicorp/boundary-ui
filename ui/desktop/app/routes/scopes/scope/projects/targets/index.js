/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
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
  @service ipc;

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
  async model({ search, scopes, availableSessions, types, page, pageSize }) {
    const orgScope = this.modelFor('scopes.scope');
    const projects = this.modelFor('scopes.scope.projects');

    // orgFilter used to narrow down resources to only those under
    // the current org scope if org is not global
    const orgFilter = `"/item/scope/parent_scope_id" == "${orgScope.id}"`;

    const filters = { scope_id: [], id: { values: [] }, type: [] };
    scopes.forEach((scope) => {
      filters.scope_id.push({ equals: scope });
    });
    types.forEach((type) => {
      filters.type.push({ equals: type });
    });

    const aliasPromise = this.store.query('alias', {
      recursive: true,
      scope_id: 'global',
      force_refresh: true,
    });
    const allTargetsPromise = !this.allTargets
      ? this.makeAllTargetsQuery(orgScope, orgFilter)
      : Promise.resolve();

    const sessions = await this.makeSessionQuery(orgScope, scopes, orgFilter);
    this.addActiveSessionFilters(filters, availableSessions, sessions);

    const query = {
      recursive: true,
      scope_id: orgScope.id,
      query: { search, filters },
      page,
      pageSize,
      force_refresh: true,
    };
    if (orgScope.isOrg && scopes.length === 0) {
      query.filter = orgFilter;
    }
    let targets = await this.store.query('target', query);
    const totalItems = targets.meta?.totalItems;
    // Filter out targets to which users do not have the connect ability
    targets = targets.filter((target) =>
      this.can.can('connect target', target),
    );

    const allTargets = await allTargetsPromise;
    if (!this.allTargets) {
      // Filter out targets to which users do not have the connect ability
      this.allTargets = allTargets.filter((target) =>
        target.authorized_actions.includes('authorize-session'),
      );
    }

    try {
      await aliasPromise;
    } catch {
      // TODO: Log this error
      // Separately await and catch the error here so we can continue loading
      // the page in case the controller doesn't support aliases yet
    }

    return {
      targets,
      projects,
      allTargets: this.allTargets,
      totalItems,
      isClientDaemonRunning: await this.ipc.invoke('isClientDaemonRunning'),
    };
  }

  async makeSessionQuery(orgScope, scopes, orgFilter) {
    // Retrieve all sessions so that the session and activeSessions getters
    // in the target model always retrieve the most up-to-date sessions.
    const sessionQuery = {
      recursive: true,
      scope_id: orgScope.id,
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
    };
    if (orgScope.isOrg && scopes.length === 0) {
      sessionQuery.filter = orgFilter;
    }
    return this.store.query('session', sessionQuery);
  }

  /**
   * Get all the targets but only load them once when entering the route. Ideally we would lazy load it when needed
   * but this can be revisited in the future.
   * @param orgScope
   * @param orgFilter
   * @returns {Promise<void>}
   */
  async makeAllTargetsQuery(orgScope, orgFilter) {
    // Query all targets for defining filtering values if entering route for first time
    const query = {
      scope_id: orgScope.id,
      recursive: true,
      force_refresh: true,
    };
    if (orgScope.isOrg) {
      query.filter = orgFilter;
    }
    const options = { pushToStore: false };
    return this.store.query('target', query, options);
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

  resetController(controller, isExiting, transition) {
    const fromScope = transition.from.find(
      (routeInfo) => routeInfo.name === 'scopes.scope',
    ).params.scope_id;
    const toScope = transition.to.find(
      (routeInfo) => routeInfo.name === 'scopes.scope',
    ).params.scope_id;

    // Reset the query params when changing scope context
    if (fromScope !== toScope) {
      controller.setProperties({
        scopes: [],
        availableSessions: [],
        types: [],
        search: '',
      });
    }
  }

  @action
  async refreshAll() {
    const orgScope = this.modelFor('scopes.scope');
    const orgFilter = `"/item/scope/parent_scope_id" == "${orgScope.id}"`;
    const allTargets = await this.makeAllTargetsQuery(orgScope, orgFilter);
    // Filter out targets to which users do not have the connect ability
    this.allTargets = allTargets.filter((target) =>
      target.authorized_actions.includes('authorize-session'),
    );

    // Prime the store by searching for only orgs in case there are new org scopes;
    // otherwise we won't be able to correctly peek the org scopes for their display name in the UI.
    await this.store.query('scope', {});

    // Refresh the proj scopes so our `modelFor` returns accurate data
    this.router.refresh('scopes.scope.projects');
  }
}
