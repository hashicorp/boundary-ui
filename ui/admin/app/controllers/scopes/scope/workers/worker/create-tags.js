/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller from '@ember/controller';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { loading } from 'ember-loading';
import { notifySuccess, notifyError } from 'core/decorators/notify';
import { TrackedArray } from 'tracked-built-ins';

export default class ScopesScopeWorkersWorkerCreateTagsController extends Controller {
  // =services

  @service router;

  // =attributes
  apiTags = new TrackedArray([]);

  // =actions

  /**
   * Add api tags for a worker.
   * @param {object} worker
   */
  @action
  @loading
  @notifyError(({ message }) => message)
  @notifySuccess('resources.worker.tags.create.success')
  async save(apiTags) {
    const worker = this.model;
    await worker.setApiTags(apiTags);
    // Clear the apiTags array after saving
    this.apiTags = new TrackedArray([]);
    this.router.transitionTo('scopes.scope.workers.worker.tags', worker);
  }

  /**
   * Cancel the creation of api tags for a worker.
   */
  @action
  cancel() {
    this.apiTags = new TrackedArray([]);
    this.router.replaceWith('scopes.scope.workers.worker.tags');
  }
}
