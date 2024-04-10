/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class ScopesScopeScopesIndexRoute extends Route {
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
    return from !== 'scopes.scope.scopes.index';
  }

  /**
   * Loads sub scopes for the current scope.
   * @returns {Promise<{totalItems: number, currentScope: ScopeModel, subScopes: [ScopeModel], scopesExist: boolean }> }
   */
  async model({ search, page, pageSize }) {
    const currentScope = this.modelFor('scopes.scope');
    const { id: scope_id } = currentScope;
    const filters = {
      scope_id: [{ equals: scope_id }],
    };

    const subScopes = await this.store.query('scope', {
      scope_id,
      query: { search, filters },
      page,
      pageSize,
    });
    const totalItems = subScopes.meta?.totalItems;
    const scopesExist = await this.getScopesExist(scope_id, totalItems);

    return {
      currentScope,
      subScopes,
      scopesExist,
      totalItems,
    };
  }

  /**
   * Sets scopesExist to true if there exists any scopes.
   * @param {string} scope_id
   * @param {number} totalItems
   * @returns {Promise<boolean>}
   */
  async getScopesExist(scope_id, totalItems) {
    if (totalItems > 0) {
      return true;
    }
    const options = { pushToStore: false, peekIndexedDB: true };
    const scopes = await this.store.query(
      'scope',
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
    return scopes.length > 0;
  }
}
