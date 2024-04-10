/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

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
    return from !== 'scopes.scope.roles.index';
  }

  /**
   * Loads queried roles and the number of roles under current scope.
   * @returns {Promise<{totalItems: number, roles: [RoleModel], rolesExist: boolean }> }
   */
  async model({ search, page, pageSize }) {
    const scope = this.modelFor('scopes.scope');
    const { id: scope_id } = scope;
    const filters = {
      scope_id: [{ equals: scope_id }],
    };

    let roles;
    let totalItems = 0;
    let rolesExist = false;
    if (this.can.can('list model', scope, { collection: 'roles' })) {
      roles = await this.store.query('role', {
        scope_id,
        query: { search, filters },
        page,
        pageSize,
      });
      totalItems = roles.meta?.totalItems;
      rolesExist = await this.getRolesExist(scope_id, totalItems);
    }

    return { roles, rolesExist, totalItems };
  }

  /**
   * Sets rolesExist to true if there exists any roles.
   * @param {string} scope_id
   * @param {number} totalItems
   * @returns {Promise<boolean>}
   */
  async getRolesExist(scope_id, totalItems) {
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
