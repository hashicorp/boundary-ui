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
   * Load all users under current scope.
   * @return {Promise{[UserModel]}}
   */
  async model({ search, page, pageSize }) {
    const scope = this.modelFor('scopes.scope');
    const { id: scope_id } = scope;

    const filters = {
      scope_id: [{ equals: scope_id }],
    };

    await this.getUsersExist(scope_id);

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

    return { users, usersExist: this.usersExist, totalItems };
  }

  async getUsersExist(scopeId) {
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
