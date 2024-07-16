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
import { debounce } from 'core/decorators/debounce';
import { notifySuccess, notifyError } from 'core/decorators/notify';

export default class ScopesScopeWorkersIndexController extends Controller {
  // =services

  @service router;
  @service can;

  // =attributes

  queryParams = [
    'search',
    { releaseVersions: { type: 'array' } },
    'page',
    'pageSize',
  ];

  @tracked search;
  @tracked releaseVersions = [];
  @tracked page = 1;
  @tracked pageSize = 10;
  @tracked selectedWorker;

  /**
   * Get release_versions for filter
   * @type {object[]}
   */
  get releaseVersionOptions() {
    const releaseVersions = this.model.workers
      .filter((worker) => worker.release_version)
      .map((worker) => worker.release_version);

    return [...new Set(releaseVersions)].map((version) => ({ id: version }));
  }

  /**
   * Return all and selected filters for filterTags component
   * @type {object}
   */
  get filters() {
    return {
      allFilters: {
        releaseVersions: this.releaseVersionOptions,
      },
      selectedFilters: {
        releaseVersions: this.releaseVersions,
      },
    };
  }

  /**
   * Get the first 10 tags of the selected worker.
   * @type {object[]}
   */
  get selectedWorkerTags() {
    // only show the first 10 tags if there are more than 10
    return this.selectedWorker.allTags.slice(0, 10);
  }

  /**
   * Build the display name for a worker tag
   * @param {object} tag
   * @returns {string}
   */
  tagDisplayName(tag) {
    return `${tag.key} = ${tag.value}`;
  }

  // =actions

  /**
   * Handles input on each keystroke and the search queryParam
   * @param {object} event
   */
  @action
  @debounce(250)
  handleSearchInput(event) {
    const { value } = event.target;
    this.search = value;
    this.page = 1;
  }

  /**
   * Sets a query param to the value of selectedItems
   * and resets the page to 1.
   * @param {string} paramKey
   * @param {[string]} selectedItems
   */
  @action
  applyFilter(paramKey, selectedItems) {
    this[paramKey] = [...selectedItems];
    this.page = 1;
  }

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
