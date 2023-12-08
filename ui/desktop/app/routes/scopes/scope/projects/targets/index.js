/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import orderBy from 'lodash/orderBy';
import {
  STATUS_SESSION_ACTIVE,
  STATUS_SESSION_PENDING,
} from 'api/models/session';

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
    page: {
      refreshModel: true,
    },
    pageSize: {
      refreshModel: true,
    },
  };

  // =methods

  /**
   * If arriving here unauthenticated, redirect to index for further processing.
   */
  beforeModel() {
    if (!this.session.isAuthenticated) this.router.transitionTo('index');
  }

  /**
   * Loads all targets and the number of targets under current scope.
   *
   * @returns {Promise<{totalItems: number, targets: [TargetModel]}>}
   */
  async model({ search, page, pageSize }) {
    // TODO: Filter targets by scope we're in manually
    // const { id: scope_id } = this.modelFor('scopes.scope');

    const queryOptions = {
      query: { search },
      page,
      pageSize,
    };

    let targets = await this.store.query('target', queryOptions);
    const totalItems = targets.meta?.totalItems;

    // Filter out targets to which users do not have the connect ability
    targets = targets.filter((target) =>
      this.can.can('connect target', target),
    );

    let targetsWithSessions = [];
    for (const target of targets) {
      let sessions = await this.store.query('session', {
        query: {
          filters: {
            target_id: { equals: target.id },
            status: [
              { equals: STATUS_SESSION_ACTIVE },
              { equals: STATUS_SESSION_PENDING },
            ],
          },
        },
      });
      sessions = orderBy(sessions, 'created_time', 'desc');
      targetsWithSessions.push({ target, sessions });
    }

    return { targets: targetsWithSessions, totalItems };
  }
}
