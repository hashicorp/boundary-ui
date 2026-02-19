/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';
import {
  STATUS_SESSION_ACTIVE,
  STATUS_SESSION_PENDING,
} from 'api/models/session';
import { action } from '@ember/object';
import { restartableTask, timeout } from 'ember-concurrency';

const { __electronLog } = globalThis;

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
    sortAttribute: {
      refreshModel: true,
      replace: true,
    },
    sortDirection: {
      refreshModel: true,
      replace: true,
    },
  };

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
   * @return {Promise<{totalItems: number, targets: [TargetModel], projects: [ScopeModel],
   * isCacheDaemonRunning: boolean, isLoadIncomplete: boolean, isCacheRefreshing: boolean}>}
   */
  async model(params) {
    const useDebounce =
      this.retrieveData?.lastPerformed?.args?.[0].search !== params.search;
    return this.retrieveData.perform({ ...params, useDebounce });
  }

  retrieveData = restartableTask(
    async ({
      search,
      scopes,
      availableSessions,
      types,
      page,
      pageSize,
      sortAttribute,
      sortDirection,
      useDebounce,
    }) => {
      if (useDebounce) {
        await timeout(250);
      }

      const isCacheRunningPromise = this.ipc.invoke('isCacheDaemonRunning');

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

      const sessions = await this.getSessions(orgScope, scopes, orgFilter);
      this.addActiveSessionFilters(filters, availableSessions, sessions);
      const sort = { attribute: sortAttribute, direction: sortDirection };
      const query = {
        recursive: true,
        scope_id: orgScope.id,
        query: { search, filters, sort },
        page,
        pageSize,
        force_refresh: true,
      };
      if (orgScope.isOrg && scopes.length === 0) {
        query.filter = orgFilter;
      }
      let targets = await this.store.query('target', query);
      const { totalItems, isLoadIncomplete, isCacheRefreshing } = targets.meta;
      // Filter out targets to which users do not have the connect ability
      targets = targets.filter((target) =>
        this.can.can('connect target', target),
      );

      const aliasPromise = this.store.query('alias', {
        scope_id: 'global',
        force_refresh: true,
        query: {
          filters: {
            destination_id: {
              logicalOperator: 'or',
              values: targets.map((target) => ({
                equals: target.id,
              })),
            },
          },
        },
      });

      // To correctly show targets with active sessions, the associated
      // sessions need to be queried to sync all the session models in
      //  ember data and retrieve their updated `status` properties
      const sessionsPromise = this.store.query('session', {
        query: {
          filters: {
            target_id: targets.map((target) => ({ equals: target.id })),
          },
        },
      });

      let allAssociatedSessions;
      // Load the sessions and aliases for the targets on the current page
      try {
        const loadedResults = await Promise.all([
          aliasPromise,
          sessionsPromise,
        ]);
        allAssociatedSessions = loadedResults[1];
      } catch (e) {
        __electronLog?.warn(
          'Could not retrieve aliases and/or sessions for targets',
          e.message,
        );
        // Separately await and catch the error here so we can continue loading
        // the page in case the controller doesn't support aliases yet
      }

      // Remove expired sessions in ember data store for symmetry with cache.
      if (allAssociatedSessions) {
        const targetIds = targets.map(({ id }) => id);
        const allAssociatedSessionIds = new Set(
          allAssociatedSessions.map(({ id }) => id),
        );
        const storedSessionIds = new Set(
          this.store
            .peekAll('session')
            .filter((s) => targetIds.includes(s?.target_id))
            .map(({ id }) => id),
        );
        const removedSessions = storedSessionIds.difference(
          allAssociatedSessionIds,
        );
        removedSessions.forEach((id) => {
          const record = this.store.peekRecord('session', id);
          this.store.unloadRecord(record);
        });
      }

      return {
        targets,
        projects,
        totalItems,
        isLoadIncomplete,
        isCacheRefreshing,
        isCacheDaemonRunning: await isCacheRunningPromise,
      };
    },
  );

  async getSessions(orgScope, scopes, orgFilter) {
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
      max_result_set_size: -1,
    };
    if (orgScope.isOrg && scopes.length === 0) {
      sessionQuery.filter = orgFilter;
    }
    return this.store.query('session', sessionQuery);
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

  setupController(controller, model) {
    super.setupController(controller, model);
    controller.currentRoute = this;
  }

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
    // Prime the store by searching for only orgs in case there are new org scopes;
    // otherwise we won't be able to correctly peek the org scopes for their display name in the UI.
    await this.store.query('scope', {});

    // Refresh the proj scopes so our `modelFor` returns accurate data
    await this.router.refresh('scopes.scope.projects');
  }
}
