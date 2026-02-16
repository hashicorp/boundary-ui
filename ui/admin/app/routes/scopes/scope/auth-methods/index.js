/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { restartableTask, timeout } from 'ember-concurrency';

export default class ScopesScopeAuthMethodsIndexRoute extends Route {
  // =services

  @service store;
  @service abilities;
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
    sortAttribute: {
      refreshModel: true,
      replace: true,
    },
    sortDirection: {
      refreshModel: true,
      replace: true,
    },
  };

  // =methods

  /**
   * Loads queried auth-methods and the number of auth-methods under current scope.
   * @returns {Promise<{totalItems: number, authMethods: [AuthMethodModel], doAuthMethodsExist: boolean }> }
   */
  async model(params) {
    const useDebounce =
      this.retrieveData?.lastPerformed?.args?.[0].search !== params.search;
    return this.retrieveData.perform({ ...params, useDebounce });
  }

  retrieveData = restartableTask(
    async ({
      search,
      types,
      primary,
      page,
      pageSize,
      sortAttribute,
      sortDirection,
      useDebounce,
    }) => {
      if (useDebounce) {
        await timeout(250);
      }

      const scope = this.modelFor('scopes.scope');
      const { id: scope_id } = scope;
      const filters = {
        scope_id: [{ equals: scope_id }],
        type: [],
        is_primary: [],
      };

      const sort =
        sortAttribute === 'name'
          ? {
              attributes: [sortAttribute, 'id'],
              direction: sortDirection,
              isCoalesced: true,
            }
          : { attributes: [sortAttribute], direction: sortDirection };

      types.forEach((type) => {
        filters.type.push({ equals: type });
      });
      if (primary.length === 1) {
        primary.forEach((val) => {
          filters.is_primary.push({ equals: val === 'true' });
        });
      }

      let authMethods;
      let totalItems = 0;
      let doAuthMethodsExist = false;
      if (
        this.abilities.can('list model', scope, { collection: 'auth-methods' })
      ) {
        // TODO: Remove storeToken option as this is a temporary fix for auth-methods.
        const options = { storeToken: false };
        authMethods = await this.store.query(
          'auth-method',
          {
            scope_id,
            query: { search, filters, sort },
            page,
            pageSize,
          },
          options,
        );
        totalItems = authMethods.meta?.totalItems;
        doAuthMethodsExist = await this.getDoAuthMethodsExist(
          scope_id,
          totalItems,
        );
      }

      return { authMethods, doAuthMethodsExist, totalItems };
    },
  );

  /**
   * Sets doAuthMethodsExist to true if there exists any auth methods.
   * @param {string} scope_id
   * @param {number} totalItems
   * @returns {Promise<boolean>}
   */
  async getDoAuthMethodsExist(scope_id, totalItems) {
    if (totalItems > 0) {
      return true;
    }
    const options = { pushToStore: false, peekDb: true };
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
