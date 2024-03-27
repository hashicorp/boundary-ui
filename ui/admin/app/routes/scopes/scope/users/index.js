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

  usersExist;

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
    if (this.can.can('list model', scope, { collection: 'users' })) {
      users = await this.store.query('user', {
        query: { search, filters },
        page,
        pageSize,
      });
      totalItems = users.meta?.totalItems;
    }
    await this.getUsersExist(scope_id, totalItems);

    return { users, usersExist: this.usersExist, totalItems };
  }

  /**
   * Sets usersExist to true if there exists any users.
   * @param {string} scopeId
   * @param {number} totalItems
   * @returns
   */
  async getUsersExist(scopeId, totalItems) {
    if (totalItems > 0) {
      this.usersExist = true;
      return;
    }
    const options = { pushToStore: false };
    const user = await this.store.query(
      'user',
      {
        query: {
          filters: {
            scope_id: [{ equals: scopeId }],
          },
        },
        page: 1,
        pageSize: 1,
      },
      options,
    );
    this.usersExist = user.length > 0;
  }

  setupController(controller) {
    const scope = this.modelFor('scopes.scope');
    super.setupController(...arguments);
    controller.setProperties({ scope });
  }
}
