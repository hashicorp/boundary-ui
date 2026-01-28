/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ScopesScopePoliciesRoute extends Route {
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
   * Load all storage policies under current scope
   * @return {Promise<[PolicyModel]>}
   */
  async model() {
    const scope = this.modelFor('scopes.scope');
    const { id: scope_id } = scope;

    if (
      this.can.can('list model', scope, {
        collection: 'policies',
      })
    ) {
      return this.store.query('policy', { scope_id });
    }
  }
}
