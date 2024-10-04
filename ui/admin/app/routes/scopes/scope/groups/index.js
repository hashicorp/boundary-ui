/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ScopesScopeGroupsIndexRoute extends Route {
  // =services

  @service store;
  @service can;

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
   * Loads queried groups and the number of groups under current scope.
   * @returns {Promise<{totalItems: number, groups: [GroupModel], doGroupsExist: boolean }> }
   */
  async model({ search, page, pageSize }) {
    const scope = this.modelFor('scopes.scope');
    const { id: scope_id } = scope;
    let groups = [];
    let totalItems = 0;
    let doGroupsExist = false;
    const filters = { scope_id: [{ equals: scope_id }] };

    if (this.can.can('list model', scope, { collection: 'groups' })) {
      groups = await this.store.query('group', {
        scope_id,
        query: { filters, search },
        page,
        pageSize,
      });
      totalItems = groups.meta?.totalItems;
      doGroupsExist = await this.getDoGroupsExist(scope_id, totalItems);
    }

    return { groups, doGroupsExist, totalItems };
  }

  /**
   * Sets doGroupsExist to true if there exists any groups.
   * @param {string} scope_id
   * @param {number} totalItems
   * @returns {Promise<boolean>}
   */
  async getDoGroupsExist(scope_id, totalItems) {
    if (totalItems > 0) {
      return true;
    }
    const options = { pushToStore: false, peekIndexedDB: true };
    const group = await this.store.query(
      'group',
      {
        scope_id: scope_id,
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

    return group.length > 0;
  }

  setupController(controller) {
    const scope = this.modelFor('scopes.scope');
    super.setupController(...arguments);
    controller.setProperties({ scope });
  }
}
