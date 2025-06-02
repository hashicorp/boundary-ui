/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { restartableTask, timeout } from 'ember-concurrency';

export default class ScopesScopeCredentialStoresIndexRoute extends Route {
  // =services

  @service store;
  @service can;

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
   * Loads queried credential-stores and the number of credential-stores under current scope.
   * @returns {Promise<{totalItems: number, credentialStores: [CredentialStoreModel], doCredentialStoresExist: boolean }> }
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
      };
      types.forEach((type) => {
        filters.type.push({ equals: type });
      });

      const sort = {
        attribute: sortAttribute,
        direction: sortDirection,
      };

      let credentialStores;
      let totalItems = 0;
      let doCredentialStoresExist = false;
      if (
        this.can.can('list model', scope, {
          collection: 'credential-stores',
        })
      ) {
        credentialStores = await this.store.query('credential-store', {
          scope_id,
          query: { search, filters, sort },
          page,
          pageSize,
        });
        totalItems = credentialStores.meta?.totalItems;
        doCredentialStoresExist = await this.getDoCredentialStoresExist(
          scope_id,
          totalItems,
        );
      }
      return { credentialStores, doCredentialStoresExist, totalItems };
    },
  );

  /**
   * Sets doCredentialStoresExist to true if there exists any credential-stores.
   * @param {string} scope_id
   * @param {number} totalItems
   * @returns {Promise<boolean>}
   */
  async getDoCredentialStoresExist(scope_id, totalItems) {
    if (totalItems > 0) {
      return true;
    }
    const options = { pushToStore: false, peekIndexedDB: true };
    const credentialStore = await this.store.query(
      'credential-store',
      {
        scope_id,
        query: { filters: { scope_id: [{ equals: scope_id }] } },
        page: 1,
        pageSize: 1,
      },
      options,
    );
    return credentialStore.length > 0;
  }

  setupController(controller) {
    const scope = this.modelFor('scopes.scope');
    super.setupController(...arguments);
    controller.setProperties({ scope });
  }
}
