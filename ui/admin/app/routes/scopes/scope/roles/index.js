/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

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
  };

  rolesExist;

  // =services

  @service can;
  @service store;

  // =methods

  /**
   * Load all roles under current scope.
   * @return {Promise{[RoleModel]}}
   */
  async model({ search, page, pageSize }) {
    const scope = this.modelFor('scopes.scope');
    const { id: scope_id } = scope;
    const filters = {
      scope_id: [{ equals: scope_id }],
    };

    let roles;
    let totalItems = 0;
    if (this.can.can('list model', scope, { collection: 'roles' })) {
      roles = await this.store.query('role', {
        query: { search, filters },
        page,
        pageSize,
      });
      totalItems = roles.meta?.totalItems;
    }
    await this.getRolesExist(scope_id, totalItems);

    return { roles, rolesExist: this.rolesExist, totalItems };
  }

  /**
   * Sets rolesExist to true if there exists any roles.
   * @param {string} scope_id
   * @param {number} totalItems
   * @returns
   */
  async getRolesExist(scope_id, totalItems) {
    if (totalItems > 0) {
      this.rolesExist = true;
      return;
    }
    const options = { pushToStore: false };
    const role = await this.store.query(
      'role',
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
    this.rolesExist = role.length > 0;
  }

  setupController(controller) {
    const scope = this.modelFor('scopes.scope');
    super.setupController(...arguments);
    controller.setProperties({ scope });
  }
}
