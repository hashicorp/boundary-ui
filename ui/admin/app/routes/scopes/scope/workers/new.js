/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { loading } from 'ember-loading';
import { notifyError, notifySuccess } from 'core/decorators/notify';
import { inject as service } from '@ember/service';

export default class ScopesScopeWorkersNewRoute extends Route {
  // =services

  @service store;

  // =methods

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

  /**
   * Created the worker and notifies the user of success or error.
   * @param {WorkerModel} worker
   * @param {string} workerGeneratedAuthToken
   */
  @action
  @loading
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('notifications.add-success')
  async createWorkerLed(worker, workerGeneratedAuthToken) {
    await worker.createWorkerLed(workerGeneratedAuthToken);
  }
}
