/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { action } from '@ember/object';
import {
  STATUS_SESSION_ACTIVE,
  STATUS_SESSION_CANCELING,
  STATUS_SESSION_PENDING,
} from 'api/models/session';
import chunk from 'lodash/chunk';

export default class ScopesScopeProjectsSessionsIndexRoute extends Route {
  // =services

  @service session;
  @service store;
  @service ipc;
  @service router;

  // =attributes

  queryParams = {
    targets: {
      refreshModel: true,
      replace: true,
    },
    status: {
      refreshModel: true,
      replace: true,
    },
    scopes: {
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

  allSessions;

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
    return from !== 'scopes.scope.projects.sessions.index';
  }

  /**
   * Loads queried sessions, the total number of sessions, all sessions,
   * all targets and all projects for filtering options for the current user.
   * @return {Promise<{sessions: [SessionModel], projects: [ScopeModel], allSessions: [SessionModel], associatedTargets: [TargetModel], totalItems: number}>}
   */
  async model({ targets, status, scopes, page, pageSize }) {
    const projects = this.modelFor('scopes.scope.projects');
    const orgScope = this.modelFor('scopes.scope');
    // orgFilter used to narrow down resources to only those under
    // the current org scope if org is not global
    const orgFilter = `"/item/scope/parent_scope_id" == "${orgScope.id}"`;

    const filters = {
      user_id: [{ equals: this.session.data.authenticated.user_id }],
      target_id: [],
      status: [],
      scope_id: [],
    };
    targets.forEach((target) => {
      filters.target_id.push({ equals: target });
    });
    status.forEach((item) => {
      filters.status.push({ equals: item });
    });
    scopes.forEach((scope) => {
      filters.scope_id.push({ equals: scope });
    });

    const queryOptions = {
      scope_id: orgScope.id,
      recursive: true,
      query: { filters },
      page,
      pageSize,
      force_refresh: true,
      max_result_set_size: -1,
    };
    if (orgScope.isOrg && scopes.length === 0) {
      queryOptions.filter = orgFilter;
    }
    const sessions = await this.store.query('session', queryOptions);
    const totalItems = sessions.meta?.totalItems;

    // Query all sessions and associated targets for defining filtering values if entering route for the first time
    if (!this.allSessions?.length) {
      await this.getAllSessions(orgScope, scopes, orgFilter);
    }
    const associatedTargets = await this.getAssociatedTargets(
      orgScope,
      orgFilter,
    );

    return {
      sessions,
      projects,
      allSessions: this.allSessions,
      associatedTargets,
      totalItems,
      isCacheDaemonRunning: await this.ipc.invoke('isCacheDaemonRunning'),
    };
  }

  async getAssociatedTargets(orgScope) {
    if (!this.allSessions) {
      return [];
    }

    const uniqueTargetIds = [
      ...new Set(this.allSessions.map((session) => session.target_id)),
    ];
    // Chunk target IDs in case there's a lot of sessions as cache daemon syntax can't take too many
    const chunkedTargetIds = chunk(uniqueTargetIds, 50);

    const associatedTargetsPromises = chunkedTargetIds.map((targetIds) =>
      this.store.query('target', {
        scope_id: orgScope.id,
        recursive: true,
        force_refresh: true,
        query: {
          filters: {
            id: {
              logicalOperator: 'or',
              values: targetIds.map((targetId) => ({
                equals: targetId,
              })),
            },
          },
        },
      }),
    );

    const targetsArray = await Promise.all(associatedTargetsPromises);
    return targetsArray.flat();
  }

  async getAllSessions(orgScope, scopes, orgFilter) {
    const allSessionsQuery = {
      scope_id: orgScope.id,
      recursive: true,
      query: {
        filters: {
          user_id: [{ equals: this.session.data.authenticated.user_id }],
        },
      },
      force_refresh: true,
      max_result_set_size: -1,
    };
    if (orgScope.isOrg && scopes.length === 0) {
      allSessionsQuery.filter = orgFilter;
    }
    this.allSessions = await this.store.query('session', allSessionsQuery, {
      pushToStore: false,
    });
  }

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
        targets: [],
        status: [
          STATUS_SESSION_ACTIVE,
          STATUS_SESSION_PENDING,
          STATUS_SESSION_CANCELING,
        ],
      });
    }
  }

  @action
  async refreshAll() {
    const orgScope = this.modelFor('scopes.scope');
    const orgFilter = `"/item/scope/parent_scope_id" == "${orgScope.id}"`;

    await this.getAllSessions(orgScope, [], orgFilter);
    await this.getAssociatedTargets(orgScope);

    // Prime the store by searching for orgs only in case there are new org scopes;
    // otherwise we won't be able to correctly peek the org scopes for their display name in the UI.
    await this.store.query('scope', {});

    // Refresh the proj scopes so our `modelFor` returns accurate data
    await this.router.refresh('scopes.scope.projects');
  }
}
