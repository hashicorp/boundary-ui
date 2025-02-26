/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
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

  sortingIntervalId;

  sort = { direction: 'ascending', attribute: 'name' };

  activate() {
    const sortAttributes = ['created_time', 'name', 'type'];

    this.sortingTimeoutId = setInterval(() => {
      const sort = {
        direction: Math.random() > 0.5 ? 'ascending' : 'descending',
        attribute:
          sortAttributes[Math.floor(Math.random() * sortAttributes.length)],
      };

      console.log('change timeout randomly every 5 seconds: ', sort);
      this.sort = sort;
      this.refresh();
    }, 5_000);
  }

  deactivate() {
    clearInterval(this.sortingTimeoutId);
  }

  // =methods

  /**
   * Loads queried targets, the number of targets under current scope, and
   * active sessions filtering options.
   * @returns {Promise<{totalItems: number, targets: [TargetModel], doTargetsExist: boolean }> }
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

    if (this.can.can('list model', scope, { collection: 'sessions' })) {
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
    }

    let targets;
    let totalItems = 0;
    let doTargetsExist = false;
    if (this.can.can('list model', scope, { collection: 'targets' })) {
      const targetMark = {
        start: 'indexed-db-handler:before-target-query',
        end: 'indexed-db-handler:after-target-query',
      };

      const { sort } = this;
      performance.mark(targetMark.start);
      targets = await this.store.query('target', {
        scope_id,
        query: {
          search,
          filters,
          sort,
        },
        page,
        pageSize,
      });

      performance.mark(targetMark.end);
      const targetQueryMeasure = performance.measure(
        'IndexedDB: Target Query',
        targetMark.start,
        targetMark.end,
      );
      console.log(
        '-------',
        'target query measure',
        sort,
        `${targetQueryMeasure.duration}ms`,
        '-------',
      );
      performance.clearMarks(targetMark.start);
      performance.clearMarks(targetMark.end);

      totalItems = targets.meta?.totalItems;
      doTargetsExist = await this.getDoTargetsExist(scope_id, totalItems);
    }

    return { targets, doTargetsExist, totalItems };
  }

  /**
   * Sets doTargetsExist to true if there exists any targets.
   * @param {string} scope_id
   * @param {number} totalItems
   * @returns {Promise<boolean>}
   */
  async getDoTargetsExist(scope_id, totalItems) {
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
