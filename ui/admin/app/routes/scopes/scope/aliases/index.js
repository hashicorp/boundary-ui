/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';
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
          attributes: [sortAttribute],
          direction: sortDirection,
        };

        const searchOptions = {
          text: search,
          relatedSearches: [
            {
              resource: 'target',
              fields: ['name'],
              join: {
                joinFrom: 'destination_id',
                joinOn: 'id',
              },
            },
          ],
        };

        const targetPromise = this.store.query(
          'target',
          {
            scope_id,
            recursive: true,
            page: 1,
            pageSize: 1,
          },
          { pushToStore: false },
        );

        aliases = await this.store.query('alias', {
          scope_id,
          query: { search: searchOptions, sort },
          page,
          pageSize,
        });

        totalItems = aliases.meta?.totalItems;

        await targetPromise;
        // All the targets should have been retrieved just before this so we don't need to make another API request
        // Check for actual aliases with destinations as an empty array will bring back all targets which we don't want
        const associatedTargets = aliases.some((alias) => alias.destination_id)
          ? await this.store.query(
              'target',
              {
                query: {
                  filters: {
                    id: aliases
                      .filter((alias) => alias.destination_id)
                      .map((alias) => ({
                        equals: alias.destination_id,
                      })),
                  },
                },
              },
              { pushToStore: true, peekDb: true },
            )
          : [];

        aliases = aliases.map((alias) => ({
          alias,
          target: associatedTargets.find(
            (target) => target.id === alias.destination_id,
          ),
        }));

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
