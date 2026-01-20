/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller from '@ember/controller';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { loading } from 'ember-loading';
import { notifySuccess, notifyError } from 'core/decorators/notify';

export default class ScopesScopeWorkersNewController extends Controller {
  // =services

  @service router;

  // =actions

  /**
   * Rollback changes on workers.
   * @param {WorkerModel} worker
   */
  @action
  async cancel(worker) {
    const { isNew } = worker;
    if (isNew) worker.rollbackAttributes();
    this.router.transitionTo('scopes.scope.workers');
    await this.router.refresh();
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
