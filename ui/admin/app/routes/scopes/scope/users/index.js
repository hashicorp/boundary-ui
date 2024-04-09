/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ScopesScopeUsersIndexRoute extends Route {
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

  // =services

  @service store;
  @service can;

  // =methods

  /**
   * Loads queried users and the number of users under current scope.
   * @returns {Promise<{totalItems: number, users: [UserModel], usersExist: boolean }> }
   */
  async model({ search, page, pageSize }) {
    const scope = this.modelFor('scopes.scope');
    const { id: scope_id } = scope;

    const filters = {
      scope_id: [{ equals: scope_id }],
    };

    let users;
    let totalItems = 0;
    let usersExist = false;
    if (this.can.can('list model', scope, { collection: 'users' })) {
      users = await this.store.query('user', {
        scope_id,
        query: { search, filters },
        page,
        pageSize,
      });
      totalItems = users.meta?.totalItems;
      usersExist = await this.getUsersExist(scope_id, totalItems);
    }

    return { users, usersExist, totalItems };
  }

  /**
   * Sets usersExist to true if there exists any users.
   * @param {string} scope_id
   * @param {number} totalItems
   * @returns {Promise<boolean>}
   */
  async getUsersExist(scope_id, totalItems) {
    if (totalItems > 0) {
      return true;
    }
    const options = { pushToStore: false, peekIndexedDB: true };
    const user = await this.store.query(
      'user',
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
    return user.length > 0;
  }

  setupController(controller) {
    const scope = this.modelFor('scopes.scope');
    super.setupController(...arguments);
    controller.setProperties({ scope });
  }
}
