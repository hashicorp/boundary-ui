/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { all, hash } from 'rsvp';

export default class ScopesScopeAliasesRoute extends Route {
  // =services

  @service store;
  @service session;
  @service can;
  @service router;

  // =methods

  /**
   * If arriving here unauthenticated, redirect to index for further processing.
   */
  beforeModel() {
    if (!this.session.isAuthenticated) this.router.transitionTo('index');
  }

  /**
   * Load all aliases in current scope
   * @return {Promise<[AliasModel]>}
   */
  async model() {
    const scope = this.modelFor('scopes.scope');
    const { id: scope_id } = scope;

    if (
      this.can.can('list model', scope, {
        collection: 'aliases',
      })
    ) {
      const aliases = await this.store.query('alias', { scope_id });
      // since we don't receive target info from aliases list API,
      // we query the store to fetch target information based on the destination id
      const aliasesWithResourceNames = await all(
        aliases.map((alias) =>
          hash({
            alias,
            target: alias.destination_id
              ? this.store.findRecord('target', alias.destination_id)
              : null,
          }),
        ),
      );
      return aliasesWithResourceNames;
    }
  }
}
