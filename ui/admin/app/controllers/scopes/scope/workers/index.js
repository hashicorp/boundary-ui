/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { loading } from 'ember-loading';
import { tracked } from '@glimmer/tracking';
import { confirm } from 'core/decorators/confirm';
import { notifySuccess, notifyError } from 'core/decorators/notify';

export default class ScopesScopeWorkersIndexController extends Controller {
  // =services

  @service router;
  @service can;

  // =attributes

  @tracked selectedWorker;

  /**
   * Get the first 10 tags of the selected worker.
   * @type {object[]}
   */
  get selectedWorkerTags() {
    // only show the first 10 tags if there are more than 10
    return this.selectedWorker.allTags.slice(0, 10);
  }

  /**
   * Build the display name for a worker tag and will
   * truncate the key if it's too long.
   * @param {object} tag
   * @returns {string}
   */
  tagDisplayName(tag) {
    const key =
      tag.key.length > 16 ? tag.key.substring(0, 16) + '...' : tag.key;
    return `${key} = ${tag.value}`;
  }

  // =actions

  /**
   * Toggle the tags flyout to display or hide the tags of a worker.
   * @param {object} selectedWorker
   */
  @action
  selectWorker(selectedWorker) {
    this.selectedWorker = selectedWorker;
  }

  /**
   * Rollback changes on workers.
   * @param {WorkerModel} worker
   */
  @action
  cancel(worker) {
    const { isNew } = worker;
    worker.rollbackAttributes();
    if (isNew) this.router.transitionTo('scopes.scope.workers');
  }

  /**
   * Save a worker in current scope.
   * @param {WorkerModel} worker
   * @param {Event} e
   */
  @action
  @loading
  @notifyError(({ message }) => message)
  @notifySuccess(({ isNew }) =>
    isNew ? 'notifications.create-success' : 'notifications.save-success',
  )
  async save(worker) {
    await worker.save();
    if (this.can.can('read model', worker)) {
      await this.router.transitionTo('scopes.scope.workers.worker', worker);
    } else {
      await this.router.transitionTo('scopes.scope.workers');
    }
    await this.router.refresh();
  }

  /**
   * Delete worker in current scope and redirect to index.
   * @param {WorkerModel} worker
   */
  @action
  @loading
  @confirm('questions.delete-confirm')
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('notifications.delete-success')
  async delete(worker) {
    await worker.destroyRecord();
    await this.router.replaceWith('scopes.scope.workers');
    await this.router.refresh();
  }
}
