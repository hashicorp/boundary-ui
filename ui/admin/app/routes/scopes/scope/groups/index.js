/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

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
   * Event to determine whether the loading template should be shown.
   * Only show the loading template during initial loads or when transitioning
   * from different routes. Don't show it when a user is just searching or
   * filtering on the same page as it can be jarring.
   * @param transition
   * @returns {boolean}
   */
  @action
  loading(transition) {
    const from = transition.from?.name;
    return from !== 'scopes.scope.groups.index';
  }

  /**
   * Loads queried groups and the number of groups under current scope.
   * @returns {Promise<{totalItems: number, groups: [GroupModel], groupsExist: boolean }> }
   */
  async model({ search, page, pageSize }) {
    const scope = this.modelFor('scopes.scope');
    const { id: scope_id } = scope;
    let groups = [];
    let totalItems = 0;
    let groupsExist = false;
    const filters = { scope_id: [{ equals: scope_id }] };

    if (this.can.can('list model', scope, { collection: 'groups' })) {
      groups = await this.store.query('group', {
        scope_id,
        query: { filters, search },
        page,
        pageSize,
      });
      totalItems = groups.meta?.totalItems;
      groupsExist = await this.getGroupsExist(scope_id, totalItems);
    }

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
