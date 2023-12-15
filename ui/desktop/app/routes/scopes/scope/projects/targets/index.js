/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

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
  async model({ search, scopes, page, pageSize }, transition) {
    const from = transition.from?.name;
    // TODO: Filter targets by scope we're in manually
    // const { id: scope_id } = this.modelFor('scopes.scope');
    const filters = { scope_id: [] };
    scopes.forEach((scope) => {
      filters.scope_id.push({ equals: scope });
    });

    const queryOptions = {
      query: { search, filters },
      page,
      pageSize,
    };
    const projects = this.modelFor('scopes.scope.projects');

    let targets = await this.store.query('target', queryOptions);
    const totalItems = targets.meta?.totalItems;

    // Filter out targets to which users do not have the connect ability
    targets = targets.filter((target) =>
      this.can.can('connect target', target),
    );

    // Retrieve all sessions so that the session and activeSessions getters
    // in the target model always retrieve the most up-to-date sessions.
      const sessions = await this.store.query('session', {
      query: {
        filters: {
          user_id: { equals: this.session.data.authenticated.user_id },
          status: [
            { equals: STATUS_SESSION_ACTIVE },
            { equals: STATUS_SESSION_PENDING },
          ],
        },
      },
      force_refresh: true,
    });

    // Query all targets for defining filtering values if entering route for first time
    if (from !== 'scopes.scope.projects.targets.index') {
      const options = { pushToStore: false };
      const allTargets = await this.store.query('target', {}, options);

      // Filter out targets to which users do not have the connect ability
      this.allTargets = allTargets.filter((target) =>
        target.authorized_actions.includes('authorize-session'),
      );
    }

    return {
      targets,
      projects,
      allTargets: this.allTargets,
      totalItems,
    };
  }
}
