/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ScopesScopeStorageBucketsStorageBucketIndexRoute extends Route {
  // =services

  @service store;

  // =methods

  async afterModel() {
    let scopes;
    const orgScopes = (
      await this.store.query('scope', {
        scope_id: 'global',
        query: { filters: { scope_id: [{ equals: 'global' }] } },
      })
    ).map((scope) => ({ model: scope }));
    scopes = [
      { model: this.store.peekRecord('scope', 'global') },
      ...orgScopes,
    ];
    this.scopes = scopes;
  }

  /**
   * Adds available global and org scopes to the context.
   * @param {Controller} controller
   */
  setupController(controller) {
    super.setupController(...arguments);
    controller.set('scopes', this.scopes);
  }
}
