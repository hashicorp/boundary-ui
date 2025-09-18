/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { loading } from 'ember-loading';
import { notifySuccess, notifyError } from 'core/decorators/notify';

export default class ScopesScopeWorkersNewController extends Controller {
  // =services

  @service router;

  // =attributes
  queryParams = [
    { search: { scope: 'controller' } },
    { types: { type: 'array' } },
    { parent_scope: { type: 'array' } },
    { show_b_side: { scope: 'controller '} },
  ]
  @tracked showBSide = false;
  @tracked search = '';
  @tracked types = [];
  @tracked parent_scope = [];
  @tracked page = 1;
  @tracked pageSize = 10;

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

  @action
  toggleBSide() {
    this.showBSide = !this.showBSide;
  }

  @action
  handleSearchInput(event) {
    const { value } = event.target;
    this.search = value;
    this.page = 1;
  }

  @action
  applyFilter(paramKey, selectedItems) {
    this[paramKey] = selectedItems;
    this.page = 1;
  }
}
