/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
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
   * @returns {Promise<{totalItems: number, groups: [GroupModel], groupsExist: boolean }> }
   */
  async model({ search, page, pageSize }) {
    const scope = this.modelFor('scopes.scope');
    const { id: scope_id } = scope;
    let groups = [];
    let totalItems = 0;

    if (this.can.can('list model', scope, { collection: 'groups' })) {
      groups = await this.store.query('group', {
        scope_id,
        query: { search },
        page,
        pageSize,
      });
      totalItems = groups.meta?.totalItems;
    }

    const groupsExist = await this.getGroupsExist(scope_id, totalItems);

    return { groups, groupsExist, totalItems };
  }

  /**
   * Sets groupsExist to true if there exists any groups.
   * @param {string} scope_id
   * @param {number} totalItems
   */
  async getGroupsExist(scope_id, totalItems) {
    if (totalItems > 0) {
      return true;
    }
    const options = { pushToStore: false };
    const group = await this.store.query(
      'group',
      {
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
