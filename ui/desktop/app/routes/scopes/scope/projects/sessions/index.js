/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

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
    const { id: scope_id } = this.modelFor('scopes.scope');

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
      scope_id,
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
          scope_id,
          recursive: true,
          query: {
            filters: {
              user_id: [{ equals: this.session.data.authenticated.user_id }],
            },
          },
        },
        options,
      );
      this.allTargets = await this.store.query(
        'target',
        { scope_id, recursive: true },
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
    const { to } = transition;
    // Reset the scopes query param when changing org scope
    if (!isExiting && to.queryParams.scopes === '[]') {
      controller.setProperties({
        scopes: [],
      });
    }
  }
}
