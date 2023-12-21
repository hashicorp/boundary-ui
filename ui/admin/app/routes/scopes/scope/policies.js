/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ScopesScopePoliciesRoute extends Route {
  // =services

  @service store;
  @service can;
  @service session;

  // =methods

  /**
   * If arriving here unauthenticated, redirect to index for further processing.
   */
  beforeModel() {
    if (!this.session.isAuthenticated) this.router.transitionTo('index');
  }

  /**
   * Load all storage buckets under current scope
   * @return {Promise<[PolicyModel]>}
   */
  async model() {
    const scope = this.modelFor('scopes.scope');
    const { id: scope_id } = scope;

    if (
      this.can.can('list scope', scope, {
        collection: 'policies',
      })
    ) {
      return this.store.query('policy', { scope_id });
    }
  }
}
