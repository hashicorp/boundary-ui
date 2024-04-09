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
   * Loads queried targets, the number of targets under current scope, and
   * active sessions filtering options.
   * @returns {Promise<{totalItems: number, targets: [TargetModel], targetsExist: boolean }> }
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
      scope_id,
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

    let targets;
    let totalItems = 0;
    let targetsExist = false;
    if (this.can.can('list model', scope, { collection: 'targets' })) {
      targets = await this.store.query('target', {
        scope_id,
        query: { search, filters },
        page,
        pageSize,
      });
      totalItems = targets.meta?.totalItems;
      targetsExist = await this.getTargetsExist(scope_id, totalItems);
    }

    return { targets, targetsExist, totalItems };
  }

  /**
   * Sets targetsExist to true if there exists any targets.
   * @param {string} scope_id
   * @param {number} totalItems
   * @returns {Promise<boolean>}
   */
  async getTargetsExist(scope_id, totalItems) {
    if (totalItems > 0) {
      return true;
    }
    const options = { pushToStore: false, peekIndexedDB: true };
    const targets = await this.store.query(
      'target',
      {
        scope_id,
        query: {
          filters: {
            scope_id: [{ equals: scope_id }],
          },
        },
        page: 1,
        pageSize: 1,
      },
      options,
    );
    return targets.length > 0;
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
