/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { restartableTask, timeout } from 'ember-concurrency';
import {
  STATUS_SESSION_ACTIVE,
  STATUS_SESSION_PENDING,
  STATUS_SESSION_CANCELING,
  STATUS_SESSION_TERMINATED,
} from 'api/models/session';
import { TYPE_TARGET_SSH, TYPE_TARGET_TCP } from 'api/models/target';

export default class ScopesScopeTargetsIndexRoute extends Route {
  // =services

  @service abilities;
  @service store;
  @service session;
  @service intl;

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
    sortAttribute: {
      refreshModel: true,
      replace: true,
    },
    sortDirection: {
      refreshModel: true,
      replace: true,
    },
  };

  // =methods

  /**
   * Loads queried targets, the number of targets under current scope, and
   * active sessions filtering options.
   * @returns {Promise<{totalItems: number, targets: [TargetModel], doTargetsExist: boolean }> }
   */
  async model(params) {
    const useDebounce =
      this.retrieveData?.lastPerformed?.args?.[0].search !== params.search;
    return this.retrieveData.perform({ ...params, useDebounce });
  }

  retrieveData = restartableTask(
    async ({
      search,
      availableSessions,
      types,
      page,
      pageSize,
      sortAttribute,
      sortDirection,
      useDebounce,
    }) => {
      if (useDebounce) {
        await timeout(250);
      }

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

      if (this.abilities.can('list model', scope, { collection: 'sessions' })) {
        await this.store.query(
          'session',
          {
            scope_id,
            include_terminated: true,
            query: {
              filters: {
                scope_id: [{ equals: scope_id }],
                status: [
                  { equals: STATUS_SESSION_ACTIVE },
                  { equals: STATUS_SESSION_PENDING },
                ],
              },
            },
            page: 1,
            pageSize: 1,
          },
          { pushToStore: false },
        );
        this.addActiveSessionFilters(filters, availableSessions);
      }

      const typeMap = {
        [TYPE_TARGET_SSH]: this.intl.t('resources.target.types.ssh'),
        [TYPE_TARGET_TCP]: this.intl.t('resources.target.types.tcp'),
      };

      const sort =
        sortAttribute === 'type'
          ? {
              attributes: [sortAttribute],
              customSort: { attributeMap: typeMap },
              direction: sortDirection,
            }
          : { attributes: [sortAttribute], direction: sortDirection };

      let targets;
      let totalItems = 0;
      let doTargetsExist = false;
      if (this.abilities.can('list model', scope, { collection: 'targets' })) {
        targets = await this.store.query('target', {
          scope_id,
          query: { search, filters, sort },
          page,
          pageSize,
        });
        totalItems = targets.meta?.totalItems;
        doTargetsExist = await this.getDoTargetsExist(scope_id, totalItems);

        // To correctly show targets with active sessions, the associated
        // sessions need to be queried to sync all the session models in
        //  ember data and retrieve their updated `status` properties
        await this.store.query(
          'session',
          {
            query: {
              filters: {
                scope_id: [{ equals: scope_id }],
                target_id: targets.map((target) => ({ equals: target.id })),
              },
            },
          },
          { peekDb: true },
        );
      }
      return { targets, doTargetsExist, totalItems };
    },
  );

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
    const options = { pushToStore: false, peekDb: true };
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
   */
  addActiveSessionFilters = (filters, availableSessions) => {
    // Don't add any filtering if the user selects both which is equivalent to no filters
    if (availableSessions.length === 2) {
      return;
    }

    availableSessions.forEach((availability) => {
      if (availability === 'yes') {
        filters.joins = [
          {
            resource: 'session',
            query: {
              filters: {
                status: {
                  logicalOperator: 'or',
                  values: [
                    { equals: STATUS_SESSION_ACTIVE },
                    { equals: STATUS_SESSION_PENDING },
                  ],
                },
              },
            },
            joinOn: 'target_id',
            joinType: 'INNER',
          },
        ];
      }

      if (availability === 'no') {
        filters.joins = [
          {
            resource: 'session',
            query: {
              filters: {
                status: {
                  logicalOperator: 'or',
                  values: [
                    { equals: STATUS_SESSION_CANCELING },
                    { equals: STATUS_SESSION_TERMINATED },
                    // We include null here because traditionally with a LEFT JOIN we'd want to do a check on
                    // `OR target_id IS NOT NULL` but this is tough to get right due to the presence of other
                    // possible filters and operator precedence with the OR. We can check for a null status instead
                    // which functionally is the same since status is normally a required field and that means
                    // a session does not exist for a particular target.
                    { equals: null },
                  ],
                },
              },
            },
            joinOn: 'target_id',
            joinType: 'LEFT',
          },
        ];
      }
    });
  };

  setupController(controller) {
    const scope = this.modelFor('scopes.scope');
    super.setupController(...arguments);
    controller.setProperties({ scope });
  }
}
