/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { hash } from 'rsvp';
import { restartableTask, timeout } from 'ember-concurrency';

export default class ScopesScopeAliasesIndexRoute extends Route {
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
   * Loads queried aliases and the number of aliases under current scope.
   * @returns {Promise<{totalItems: number, aliases: [object], aliasesExist: boolean}>}
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
      useDebounce,
      sortAttribute,
      sortDirection,
    }) => {
      if (useDebounce) {
        await timeout(250);
      }

      const scope = this.modelFor('scopes.scope');
      const { id: scope_id } = scope;

      let aliases;
      let doAliasesExist = false;
      let totalItems = 0;

      if (
        this.can.can('list model', scope, {
          collection: 'aliases',
        })
      ) {
        const sort = {
          attribute: sortAttribute,
          direction: sortDirection,
        };

        aliases = await this.store.query('alias', {
          scope_id,
          query: { search, sort },
          page,
          pageSize,
        });

        totalItems = aliases.meta?.totalItems;
        // since we don't receive target info from aliases list API,
        // we query the store to fetch target information based on the destination id
        aliases = await Promise.all(
          aliases.map((alias) =>
            hash({
              alias,
              target: alias.destination_id
                ? this.store.findRecord('target', alias.destination_id, {
                    backgroundReload: false,
                  })
                : null,
            }),
          ),
        );
        doAliasesExist = await this.getDoAliasesExist(scope_id, totalItems);
      }

      return { aliases, doAliasesExist, totalItems };
    },
  );

  /**
   * Sets doAliasesExist to true if there are any aliases.
   * @param {string} scope_id
   * @param {number} totalItems
   * @returns {Promise<boolean>}
   */
  async getDoAliasesExist(scope_id, totalItems) {
    if (totalItems > 0) {
      return true;
    }
    const options = { pushToStore: false, peekDb: true };
    const aliases = await this.store.query(
      'alias',
      {
        scope_id,
        query: { filters: { scope_id: [{ equals: scope_id }] } },
        page: 1,
        pageSize: 1,
      },
      options,
    );
    return aliases.length > 0;
  }

  setupController(controller) {
    const scope = this.modelFor('scopes.scope');
    super.setupController(...arguments);
    controller.setProperties({ scope });
  }
}
