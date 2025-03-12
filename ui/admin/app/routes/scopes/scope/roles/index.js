/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';

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

  // =services

  @service can;
  @service store;

  // =methods

  /**
   * Loads queried roles and the number of roles under current scope.
   * @returns {Promise<{totalItems: number, roles: [RoleModel], doRolesExist: boolean }> }
   */
  async model({ search, page, pageSize }) {
    const scope = this.modelFor('scopes.scope');
    const { id: scope_id } = scope;
    const filters = {
      scope_id: [{ equals: scope_id }],
    };

    let roles;
    let totalItems = 0;
    let doRolesExist = false;
    if (this.can.can('list model', scope, { collection: 'roles' })) {
      roles = await this.store.query('role', {
        scope_id,
        query: { search, filters },
        page,
        pageSize,
      });
      totalItems = roles.meta?.totalItems;
      doRolesExist = await this.getDoRolesExist(scope_id, totalItems);
    }

    return { roles, doRolesExist, totalItems };
  }

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
