/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ScopesScopeWorkersNewRoute extends Route {
  // =services

  @service store;
  @service abilities;
  @service router;

  // =methods

  /**
   * Redirect to parent route when scope does not have create authorized action.
   */
  beforeModel() {
    const scopeModel = this.modelFor('scopes.scope');
    if (
      this.abilities.cannot('create worker led worker', scopeModel, {
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
