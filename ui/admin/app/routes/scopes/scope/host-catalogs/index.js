/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { restartableTask, timeout } from 'ember-concurrency';

export default class ScopesScopeHostCatalogsIndexRoute extends Route {
  // =services

  @service store;
  @service can;

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
   * Loads all host catalogs under the current scope.
   * @returns {Promise<{doHostCatalogsExist: boolean, totalItems: number, hostCatalogs: [HostCatalogModel]}>}
   */
  async model(params) {
    const useDebounce =
      this.retrieveData?.lastPerformed?.args?.[0].search !== params.search;
    return this.retrieveData.perform({ ...params, useDebounce });
  }

  retrieveData = restartableTask(
    async ({
      search,
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
        'plugin.name': [],
      };

      const sort =
        sortAttribute === 'name'
          ? {
              attributes: [sortAttribute, 'id'],
              direction: sortDirection,
              isCoalesced: true,
            }
          : { attributes: [sortAttribute], direction: sortDirection };

      let hostCatalogs;
      let totalItems = 0;
      let doHostCatalogsExist = false;
      if (this.can.can('list model', scope, { collection: 'host-catalogs' })) {
        hostCatalogs = await this.store.query('host-catalog', {
          scope_id,
          query: { search, filters, sort },
          page,
          pageSize,
        });
        totalItems = hostCatalogs.meta?.totalItems;
        doHostCatalogsExist = await this.getDoHostCatalogsExist(
          scope_id,
          totalItems,
        );
      }

      return { hostCatalogs, totalItems, doHostCatalogsExist };
    },
  );

  /**
   * Returns true if any host catalogs exist.
   * @param {string} scope_id
   * @param {number} totalItems
   * @returns {Promise<boolean>}
   */
  async getDoHostCatalogsExist(scope_id, totalItems) {
    if (totalItems > 0) {
      return true;
    }

    const options = { pushToStore: false, peekDb: true };
    const hostCatalogs = await this.store.query(
      'host-catalog',
      {
        scope_id,
        query: { filters: { scope_id: [{ equals: scope_id }] } },
        page: 1,
        pageSize: 1,
      },
      options,
    );

    return hostCatalogs.length > 0;
  }

  setupController(controller) {
    const scope = this.modelFor('scopes.scope');
    super.setupController(...arguments);
    controller.setProperties({ scope });
  }
}
