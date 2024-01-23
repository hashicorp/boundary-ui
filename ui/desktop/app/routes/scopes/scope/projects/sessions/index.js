/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import {
  STATUS_SESSION_ACTIVE,
  STATUS_SESSION_PENDING,
  STATUS_SESSION_CANCELING,
} from 'api/models/session';

export default class ScopesScopeProjectsSessionsIndexRoute extends Route {
  // =services

  @service session;
  @service store;
  @service ipc;

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
    return from !== 'scopes.scope.projects.sessions.index';
  }

  /**
   * Loads queried sessions, the total number of sessions, all sessions,
   * all targets and all projects for filtering options for the current user.
   * @return {Promise<{sessions: [SessionModel], projects: [ScopeModel], allSessions: [SessionModel], allTargets: [TargetModel], totalItems: number}>}
   */
  async model({ targets, status, scopes, page, pageSize }, transition) {
    const from = transition.from?.name;
    const projects = this.modelFor('scopes.scope.projects');
    const projectIds = projects.map((project) => project.id);
    const orgScope = this.modelFor('scopes.scope');

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
    if (scopes.length === 0) {
      projectIds.forEach((projectId) => {
        filters.scope_id.push({ equals: projectId });
      });
    }

    const queryOptions = {
      scope_id: orgScope.id,
      recursive: true,
      query: { filters },
      page,
      pageSize,
      force_refresh: true,
    };
    const sessions = await this.store.query('session', queryOptions);
    const totalItems = sessions.meta?.totalItems;

    // Query all sessions and all targets for defining filtering values if entering route for the first time
    if (from !== 'scopes.scope.projects.sessions.index') {
      const options = { pushToStore: false };
      this.allSessions = await this.store.query(
        'session',
        {
          scope_id: orgScope.id,
          recursive: true,
          query: {
            filters: {
              user_id: [{ equals: this.session.data.authenticated.user_id }],
            },
          },
        },
        options,
      );
      const allTargetsQuery = { scope_id: orgScope.id, recursive: true };
      if (orgScope.isOrg) {
        // orgFilter used to narrow down resources to only those under
        // the current org scope if org is not global
        allTargetsQuery.filter = `"/item/scope/parent_scope_id" == "${orgScope.id}"`;
      }
      this.allTargets = await this.store.query(
        'target',
        allTargetsQuery,
        options,
      );
    }

    return {
      sessions,
      projects,
      allSessions: this.allSessions,
      allTargets: this.allTargets,
      totalItems,
      isClientDaemonRunning: await this.ipc.invoke('isClientDaemonRunning'),
    };
  }

  resetController(controller, isExiting, transition) {
    const { scopes, targets, status } = transition.to.queryParams;
    // Reset the scopes query param when changing org scope
    if (isExiting && (scopes || targets || status)) {
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
}
