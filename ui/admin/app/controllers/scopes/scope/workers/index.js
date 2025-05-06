/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller from '@ember/controller';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { loading } from 'ember-loading';
import { tracked } from '@glimmer/tracking';
import { confirm } from 'core/decorators/confirm';
import { notifySuccess, notifyError } from 'core/decorators/notify';

export default class ScopesScopeWorkersIndexController extends Controller {
  // =services

  @service can;
  @service intl;
  @service router;

  // =attributes

  @tracked selectedWorker;
  @tracked tags = [];

  queryParams = [{ tags: { type: 'array' } }];

  /**
   * Returns all unique tags of the selected worker in base64 encoded format.
   * @type {object}
   */

  get groupedTags() {
    const allTags = this.model
      .flatMap((worker) => worker.allTags)
      .filter(Boolean);

    const seen = new Set();
    const uniqueTags = [];

    for (const tag of allTags) {
      const encodedTag = window.btoa(JSON.stringify(tag));

      if (!seen.has(encodedTag)) {
        seen.add(encodedTag);
        uniqueTags.push(encodedTag);
      }
    }
    return uniqueTags;
  }

  /**
   * Returns the selected tags of a worker in base64 encoded format.
   *  @type {object}
   */
  get encodedTags() {
    return this.tags.map((tag) => {
      const stringify = JSON.stringify(tag);
      return window.btoa(stringify);
    });
  }

  /**
   * Returns the filters object used for displaying filter tags.
   * @type {object}
   */

  get filters() {
    return {
      allFilters: {
        tags: this.groupedTags,
      },
      selectedFilters: {
        tags: this.encodedTags,
      },
    };
  }

  /**
   * If can list (at least): return default welcome message.
   * If can create (only): return create-but-not-list welcome message.
   * If can neither list nor create: return neither-list-nor-create welcome message
   * @type {string}
   */
  get messageDescription() {
    const canList = this.can.can('list worker', this.scope, {
      collection: 'workers',
    });
    const canCreate = this.can.can('create worker led worker', this.scope, {
      collection: 'workers',
    });
    const resource = this.intl.t('titles.workers');
    let description = 'descriptions.neither-list-nor-create';

    if (canList) {
      description = 'resources.worker.description';
    } else if (canCreate) {
      description = 'descriptions.create-but-not-list';
    }

    return this.intl.t(description, { resource });
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
   * Sets a query param to the value of selectedItems
   * @param {string} paramKey
   * @param {[string]} selectedItems
   */
  @action
  applyFilter(paramKey, selectedItems) {
    // Decoding the selectedItems
    const decodedItems = selectedItems.map((item) => {
      const decodedString = window.atob(item);
      return JSON.parse(decodedString);
    });
    this[paramKey] = [...decodedItems];
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

  /**
   * Refreshes worker data.
   */
  @action
  refresh() {
    this.router.refresh('scopes.scope.workers');
  }

  /**
   * Removes a filter from the selected filters and updates the query params.
   * @param {object} tag - The tag to remove from the filters.
   **/
  @action
  removeFilter(tag) {
    const decodedFilters = this.filters.selectedFilters['tags'].map((item) => {
      const decodedString = window.atob(item);
      return JSON.parse(decodedString);
    });
    const updatedFilters = decodedFilters.filter(
      (item) => item.key !== tag.key || item.value !== tag.value,
    );
    const queryParams = {
      tags: updatedFilters,
    };
    this.router.replaceWith({ queryParams });
  }
}
