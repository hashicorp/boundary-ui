/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ScopesScopeAuthMethodsIndexRoute extends Route {
  // =services

  @service store;
  @service can;
  @service router;

  // =attributes

  queryParams = {
    search: {
      refreshModel: true,
      replace: true,
    },
    types: {
      refreshModel: true,
      replace: true,
    },
    primary: {
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
   * Loads queried auth-methods and the number of auth-methods under current scope.
   * @returns {Promise<{totalItems: number, authMethods: [AuthMethodModel], authMethodsExist: boolean }> }
   */
  async model({ search, types, primary, page, pageSize }) {
    const scope = this.modelFor('scopes.scope');
    const { id: scope_id } = scope;
    const filters = {
      scope_id: [{ equals: scope_id }],
      type: [],
      is_primary: [],
    };

    types.forEach((type) => {
      filters.type.push({ equals: type });
    });
    if (primary.length == 1) {
      primary.forEach((val) => {
        filters.is_primary.push({ equals: val });
      });
    }

    let authMethods;
    let totalItems = 0;
    let authMethodsExist = false;
    if (this.can.can('list model', scope, { collection: 'auth-methods' })) {
      authMethods = await this.store.query('auth-method', {
        scope_id,
        query: { search, filters },
        page,
        pageSize,
      });
      totalItems = authMethods.meta?.totalItems;
      authMethodsExist = await this.getAuthMethodsExist(scope_id, totalItems);
    }

    return { authMethods, authMethodsExist, totalItems };
  }

  /**
   * Sets authMethodsExist to true if there exists any auth methods.
   * @param {string} scope_id
   * @param {number} totalItems
   * @returns {Promise<boolean>}
   */
  async getAuthMethodsExist(scope_id, totalItems) {
    if (totalItems > 0) {
      return true;
    }
    const options = { pushToStore: false, peekIndexedDB: true };
    const authMethod = await this.store.query(
      'auth-method',
      {
        scope_id,
        query: { filters: { scope_id: [{ equals: scope_id }] } },
        page: 1,
        pageSize: 1,
      },
      options,
    );
    return authMethod.length > 0;
  }

  /**
   * Adds the scope to the controller context.
   * @param {Controller} controller
   */
  setupController(controller) {
    super.setupController(...arguments);
    const scopeModel = this.modelFor('scopes.scope');
    controller.scopeModel = scopeModel;
  }
}
