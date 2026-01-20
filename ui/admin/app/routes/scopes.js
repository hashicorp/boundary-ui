/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { TrackedArray } from 'tracked-built-ins';

export default class ScopesRoute extends Route {
  // =services

  @service store;

  // =methods

  /**
   * Attempt to load all scopes from the API.  This is allowed
   * to fail, since in some cases the user may not have permission to read a
   * scope directly, but may have permission to read resources under it.
   * If scopes fails to load, we still proceed using an empty array.
   * @param {object} params
   * @param {string} params.scope_id
   * @return {Promise{[ScopeModel]}}
   */
  async model() {
    // Always preload the global scope, if possible, since the query below
    // only fetches org scopes.
    await this.store.findRecord('scope', 'global').catch(() => {
      /* no op */
    });
    // Return all org scopes.
    return this.store
      .query('scope', {
        scope_id: 'global',
        query: { filters: { scope_id: [{ equals: 'global' }] } },
      })
      .catch(() => new TrackedArray([]));
  }
}
