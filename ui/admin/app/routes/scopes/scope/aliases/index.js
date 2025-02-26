/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { hash } from 'rsvp';

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
  };

  sortingIntervalId;

  sort = { direction: 'ascending', attribute: 'name' };

  activate() {
    const sortAttributes = ['created_time', 'name'];

    this.sortingTimeoutId = setInterval(() => {
      const sort = {
        direction: Math.random() > 0.5 ? 'ascending' : 'descending',
        attribute:
          sortAttributes[Math.floor(Math.random() * sortAttributes.length)],
      };

      console.log('change timeout randomly every 5 seconds: ', sort);
      this.sort = sort;
      this.refresh();
    }, 5_000);
  }

  deactivate() {
    clearInterval(this.sortingTimeoutId);
  }

  // =methods

  /**
   * Loads queried aliases and the number of aliases under current scope.
   * @returns {Promise<{totalItems: number, aliases: [object], aliasesExist: boolean}>}
   */
  async model({ search, page, pageSize }) {
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
      const aliasMark = {
        start: 'indexed-db-handler:before-alias-query',
        end: 'indexed-db-handler:after-alias-query',
      };

      const { sort } = this;
      performance.mark(aliasMark.start);
      aliases = await this.store.query('alias', {
        scope_id,
        query: { search, sort },
        page,
        pageSize,
      });

      performance.mark(aliasMark.end);
      const aliasQueryMeasure = performance.measure(
        'Aliases Query',
        aliasMark.start,
        aliasMark.end,
      );
      console.log(
        '-------',
        'aliases query measure',
        sort,
        `${aliasQueryMeasure.duration}ms`,
        '-------',
      );
      performance.clearMarks(aliasMark.start);
      performance.clearMarks(aliasMark.end);

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
  }

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
    const options = { pushToStore: false, peekIndexedDB: true };
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
