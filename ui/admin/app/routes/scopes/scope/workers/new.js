/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ScopesScopeWorkersNewRoute extends Route {
  // =services

  @service store;
  @service can;
  @service router;

  // =methods

  /**
   * Redirect to parent route when scope does not have create authorized action.
   */
  beforeModel() {
    const scopeModel = this.modelFor('scopes.scope');
    if (
      this.can.cannot('create worker led worker', scopeModel, {
        collection: 'workers',
      })
    ) {
      this.router.replaceWith('scopes.scope.workers');
    }
  }

  /**
   * Creates a new unsaved worker.
   * @return {WorkerModel}
   */
  model() {
    const scopeModel = this.modelFor('scopes.scope');
    const record = this.store.createRecord('worker');
    record.scopeModel = scopeModel;
    return record;
  }
}
