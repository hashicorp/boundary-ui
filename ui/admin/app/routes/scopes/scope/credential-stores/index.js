/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

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
  };

  // =methods

  /**
   * Loads queried credential-stores and the number of credential-stores under current scope.
   * @returns {Promise<{totalItems: number, credentialStores: [CredentialStoreModel], credentialStoresExist: boolean }> }
   */
  async model({ search, types, page, pageSize }) {
    const scope = this.modelFor('scopes.scope');
    const { id: scope_id } = scope;

    const filters = {
      scope_id: [{ equals: scope_id }],
      type: [],
    };
    types.forEach((type) => {
      filters.type.push({ equals: type });
    });

    let credentialStores;
    let totalItems = 0;
    let credentialStoresExist = false;
    if (
      this.can.can('list model', scope, {
        collection: 'credential-stores',
      })
    ) {
      credentialStores = await this.store.query('credential-store', {
        scope_id,
        query: { search, filters },
        page,
        pageSize,
      });
      totalItems = credentialStores.meta?.totalItems;
      credentialStoresExist = await this.getCredentialStoresExist(
        scope_id,
        totalItems,
      );
    }

    return { credentialStores, credentialStoresExist, totalItems };
  }

  /**
   * Sets credentialStoresExist to true if there exists any credential-stores.
   * @param {string} scope_id
   * @param {number} totalItems
   * @returns {Promise<boolean>}
   */
  async getCredentialStoresExist(scope_id, totalItems) {
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
