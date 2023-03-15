/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ScopesScopeWorkersWorkerRoute extends Route {
  // =services

  @service store;

  // =methods

  /**
   * Load a worker in current scope.
   * @param {object} params
   * @param {string} params.worker_id
   * @return {WorkerModel}
   */
  model({ worker_id }) {
    return this.store.findRecord('worker', worker_id);
  }
}
