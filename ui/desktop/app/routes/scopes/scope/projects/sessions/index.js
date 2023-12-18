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
  };

  allSessions;
  allTargets;

  // =methods

  /**
   * Loads all sessions under current scope for the current user.
   *
   * NOTE:  previously, sessions were filtered only with API filter queries.
   *        In an effort to offload processing from the controller, sessions
   *        are now filtered on the client by projects and status,
   *        while user_id filtering remains server side.
   *
   * @return {Promise<{sessions: [SessionModel], allSessions: [SessionModel]}>}
   */
  async model({ targets }, transition) {
    const from = transition.from?.name;

    const filters = {
      user_id: { equals: this.session.data.authenticated.user_id },
      target_id: [],
    };
    targets.forEach((target) => {
      filters.target_id.push({ equals: target });
    });

    const queryOptions = { query: { filters }, force_refresh: true };
    const sessions = await this.store.query('session', queryOptions);

    // Query all sessions and all targets for defining filtering values if entering route for the first time
    if (from !== 'scopes.scope.projects.sessions.index') {
      const options = { pushToStore: false };
      this.allSessions = await this.store.query(
        'session',
        {
          query: {
            filters: {
              user_id: { equals: this.session.data.authenticated.user_id },
            },
          },
        },
        options,
      );
      this.allTargets = await this.store.query('target', {}, options);
    }

    return {
      sessions,
      allSessions: this.allSessions,
      allTargets: this.allTargets,
    };
  }
}
