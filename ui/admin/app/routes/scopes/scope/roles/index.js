/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { restartableTask, timeout } from 'ember-concurrency';
import { sortNameWithIdFallback } from 'admin/utils/sort-name-with-id-fallback';
import { GRANT_SCOPE_THIS } from 'api/models/role';

export default class ScopesScopeRolesIndexRoute extends Route {
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
    sortAttribute: {
      refreshModel: true,
      replace: true,
    },
    sortDirection: {
      refreshModel: true,
      replace: true,
    },
  };

  customSortFunction = {
    name: sortNameWithIdFallback,
    grant_scope_ids: (recordA, recordB) => {
      const a = recordA.attributes?.grant_scope_ids.includes(GRANT_SCOPE_THIS);
      const b = recordB.attributes?.grant_scope_ids.includes(GRANT_SCOPE_THIS);
      if (a === b) {
        return 0;
      } else if (a) {
        return 1;
      } else {
        return -1;
      }
    },
  };

  // =services

  @service can;
  @service store;

  // =methods

  /**
   * Loads queried roles and the number of roles under current scope.
   * @returns {Promise<{totalItems: number, roles: [RoleModel], doRolesExist: boolean }> }
   */
  async model(params) {
    const useDebounce =
      this.retrieveData?.lastPerformed?.args?.[0].search !== params.search;
    return this.retrieveData.perform({ ...params, useDebounce });
  }

  retrieveData = restartableTask(
    async ({
      search,
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
      };

      const sortFunction = this.customSortFunction[sortAttribute];
      const sort = sortFunction
        ? { sortFunction, direction: sortDirection }
        : { attribute: sortAttribute, direction: sortDirection };

      let roles;
      let totalItems = 0;
      let doRolesExist = false;
      if (this.can.can('list model', scope, { collection: 'roles' })) {
        roles = await this.store.query('role', {
          scope_id,
          query: { search, filters, sort },
          page,
          pageSize,
        });
        totalItems = roles.meta?.totalItems;
        doRolesExist = await this.getDoRolesExist(scope_id, totalItems);
      }

      return { roles, doRolesExist, totalItems };
    },
  );

  /**
   * Sets doRolesExist to true if there exists any roles.
   * @param {string} scope_id
   * @param {number} totalItems
   * @returns {Promise<boolean>}
   */
  async getDoRolesExist(scope_id, totalItems) {
    if (totalItems > 0) {
      return true;
    }
    const options = { pushToStore: false, peekIndexedDB: true };
    const role = await this.store.query(
      'role',
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
    return role.length > 0;
  }

  setupController(controller) {
    const scope = this.modelFor('scopes.scope');
    super.setupController(...arguments);
    controller.setProperties({ scope });
  }
}
