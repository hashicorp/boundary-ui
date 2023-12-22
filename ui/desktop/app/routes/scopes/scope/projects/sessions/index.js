/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ScopesScopeProjectsSessionsIndexRoute extends Route {
  // =services

  @service session;
  @service store;

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
   * Loads queried sessions, the total number of sessions, all sessions,
   * all targets and all projects for filtering options for the current user.
   * @return {Promise<{sessions: [SessionModel], projects: [ScopeModel], allSessions: [SessionModel], allTargets: [TargetModel], totalItems: number}>}
   */
  async model({ targets, status, scopes, page, pageSize }, transition) {
    const from = transition.from?.name;

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
          query: {
            filters: {
              user_id: [{ equals: this.session.data.authenticated.user_id }],
            },
          },
        },
        options,
      );
      this.allTargets = await this.store.query('target', {}, options);
    }

    const projects = this.modelFor('scopes.scope.projects');

    return {
      sessions,
      projects,
      allSessions: this.allSessions,
      allTargets: this.allTargets,
      totalItems,
    };
  }
}
