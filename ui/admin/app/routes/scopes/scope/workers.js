/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ScopesScopeWorkersRoute extends Route {
  // =services

  @service store;
  @service abilities;
  @service session;
  @service router;

  // =methods

  /**
   * If arriving here unauthenticated, redirect to index for further processing.
   */
  beforeModel() {
    if (!this.session.isAuthenticated) this.router.transitionTo('index');
  }

  /**
   * Load all workers.
   * @return {WorkerModel}
   */
  model() {
    const scope = this.modelFor('scopes.scope');
    const { id: scope_id } = scope;
    if (this.abilities.can('list worker', scope, { collection: 'workers' })) {
      return this.store.query('worker', { scope_id });
    }
  }
}
