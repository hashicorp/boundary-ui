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
  @service session;
  @service can;
  @service router;

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
   * Loads queried aliases and the number of aliases under current scope.
   * @returns {Promise<{totalItems: number, aliases: [object], aliasesExist: boolean}>}
   */
  async model({ search, page, pageSize }) {
    const scope = this.modelFor('scopes.scope');
    const { id: scope_id } = scope;

    let aliases;
    let aliasesExist;
    let totalItems = 0;

    if (
      this.can.can('list model', scope, {
        collection: 'aliases',
      })
    ) {
      aliases = await this.store.query('alias', {
        scope_id,
        query: { search },
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
              ? this.store.findRecord('target', alias.destination_id)
              : null,
          }),
        ),
      );
      aliasesExist = await this.getAliasesExist(scope_id, totalItems);
    }

    return { aliases, aliasesExist, totalItems };
  }

  /**
   * Sets aliasesExist to true if there any aliases.
   * @param {string} scope_id
   * @param {number} totalItems
   * @returns {Promise<boolean>}
   */
  async getAliasesExist(scope_id, totalItems) {
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
