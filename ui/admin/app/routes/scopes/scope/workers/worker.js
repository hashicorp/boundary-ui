/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ScopesScopeWorkersWorkerRoute extends Route {
  // =services

  @service store;
  @service can;
  @service router;

  // =methods

  /**
   * Load a worker in current scope.
   * @param {object} params
   * @param {string} params.worker_id
   * @return {Promise{WorkerModel}}
   */
  async model({ worker_id }) {
    return this.store.findRecord('worker', worker_id, { reload: true });
  }

  /**
   * Redirects to route with correct scope id if incorrect.
   * @param {WorkerModel} worker
   */
  redirect(worker) {
    const scope = this.modelFor('scopes.scope');
    if (worker.scopeID !== scope.id) {
      this.router.replaceWith(
        'scopes.scope.workers.worker',
        worker.scopeID,
        worker.id
      );
    }
  }
}
