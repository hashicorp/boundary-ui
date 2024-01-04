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

export default class ScopesScopeTargetsIndexRoute extends Route {
  // =services

  @service can;
  @service store;
  @service session;

  // =attributes

  queryParams = {
    search: {
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

  // =methods

  /**
   * Loads all targets under current scope.
   * @return {Promise{[TargetModel]}}
   */
  async model({ search, availableSessions, types, page, pageSize }) {
    const scope = this.modelFor('scopes.scope');
    const { id: scope_id } = scope;

    const filters = {
      scope_id: [{ equals: scope_id }],
      id: { values: [] },
      type: [],
    };
    types.forEach((type) => {
      filters.type.push({ equals: type });
    });

    const sessions = await this.store.query('session', {
      query: {
        filters: {
          scope_id: [{ equals: scope_id }],
          status: [
            { equals: STATUS_SESSION_ACTIVE },
            { equals: STATUS_SESSION_PENDING },
          ],
        },
      },
    });
    this.addActiveSessionFilters(filters, availableSessions, sessions);

    this.getAllTargets(scope_id);

    let targets;
    let totalItems = 0;
    if (this.can.can('list model', scope, { collection: 'targets' })) {
      targets = await this.store.query('target', {
        query: { search, filters },
        page,
        pageSize,
      });
      totalItems = targets.meta?.totalItems;
    }

    return { targets, allTargets: this.allTargets, totalItems };
  }

  async getAllTargets(scopeId) {
    const options = { pushToStore: false };
    this.allTargets = await this.store.query(
      'target',
      {
        query: {
          filters: {
            scope_id: [{ equals: scopeId }],
          },
        },
      },
      options,
    );
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

  setupController(controller) {
    const scope = this.modelFor('scopes.scope');
    super.setupController(...arguments);
    controller.setProperties({ scope });
  }
}
