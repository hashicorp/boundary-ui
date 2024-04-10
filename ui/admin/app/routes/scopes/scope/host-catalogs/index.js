/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

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
  };

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
    return from !== 'scopes.scope.host-catalogs.index';
  }

  /**
   * Loads all host catalogs under the current scope.
   * @returns {Promise<{hostCatalogsExist: boolean, totalItems: number, hostCatalogs: [HostCatalogModel]}>}
   */
  async model({ search, page, pageSize }) {
    const scope = this.modelFor('scopes.scope');
    const { id: scope_id } = scope;

    const filters = {
      scope_id: [{ equals: scope_id }],
      type: [],
      'plugin.name': [],
    };

    let hostCatalogs;
    let totalItems = 0;
    let hostCatalogsExist = false;
    if (this.can.can('list model', scope, { collection: 'host-catalogs' })) {
      hostCatalogs = await this.store.query('host-catalog', {
        scope_id,
        query: { search, filters },
        page,
        pageSize,
      });
      totalItems = hostCatalogs.meta?.totalItems;
      hostCatalogsExist = await this.getHostCatalogsExist(scope_id, totalItems);
    }

    return { hostCatalogs, totalItems, hostCatalogsExist };
  }

  /**
   * Returns true if any host catalogs exist.
   * @param {string} scope_id
   * @param {number} totalItems
   * @returns {boolean}
   */
  async getHostCatalogsExist(scope_id, totalItems) {
    if (totalItems > 0) {
      return true;
    }

    const options = { pushToStore: false, peekIndexedDB: true };
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
