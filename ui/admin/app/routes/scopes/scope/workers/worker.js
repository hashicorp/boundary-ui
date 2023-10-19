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
   * @return {WorkerModel}
   */
  async model({ worker_id }) {
    return this.store.findRecord('worker', worker_id);
  }

  redirect(worker) {
    const scope = this.modelFor('scopes.scope');
    if (
      this.can.cannot('read worker', worker, {
        resource_id: worker.scopeID,
        collection_id: scope.id,
      })
    ) {
      this.router.transitionTo(
        'scopes.scope.workers.worker',
        worker.scopeID,
        worker.id
      );
    }
  }
}
