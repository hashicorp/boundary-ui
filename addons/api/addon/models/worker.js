/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import GeneratedWorkerModel from '../generated/models/worker';
import { attr } from '@ember-data/model';

export default class WorkerModel extends GeneratedWorkerModel {
  // =attributes

  /**
   * Names are optional on models in our API.  Thus we need to fallback on ID
   * for display purposes.
   * @type {string}
   */
  get displayName() {
    return this.name || this.id;
  }

  /**
   * Returns whether the worker is a pki worker.
   * @type {boolean}
   */
  get isPki() {
    return this.type === 'pki';
  }

  /**
   * Returns the number of canonical tags present on the worker.
   * @type {number}
   */
  get tagCount() {
    if (!this.canonical_tags) {
      return 0;
    }
    return Object.values(this.canonical_tags).reduce(
      (previousCount, currentTags) => previousCount + currentTags.length,
      0,
    );
  }

  /**
   * Returns the config tags as an array of key/value pair objects.
   * @type {[object]}
   */
  get configTagList() {
    if (!this.config_tags) {
      return null;
    }

    return Object.entries(this.config_tags).flatMap(([key, value]) =>
      value.map((tag) => ({ key, value: tag, type: 'config' })),
    );
  }

  /**
   * Returns the api tags as an array of key/value pair objects.
   * @type {[object]}
   */
  get apiTagList() {
    if (!this.api_tags) {
      return null;
    }

    return Object.entries(this.api_tags).flatMap(([key, value]) =>
      value.map((tag) => ({ key, value: tag, type: 'api' })),
    );
  }

  /**
   * Returns all tags as an array of key/value pair objects with tag type.
   * @type {[object]}
   */
  get allTags() {
    return [...(this.configTagList ?? []), ...(this.apiTagList ?? [])];
  }

  @attr({
    description:
      'The deduplicated union of the tags reported by the worker ' +
      'from its configuration and any tags added through other means.\nOutput only.',
    readOnly: true,
  })
  canonical_tags;

  @attr({
    description:
      "The tags set in the worker's configuration file.\nOutput only.",
    readOnly: true,
  })
  config_tags;

  @attr({
    description: 'The api tags set for the worker.\nOutput only.',
  })
  api_tags;

  /**
   * Method to modify the adapter to handle custom POST route for creating worker.
   * @param {string} workerGeneratedAuthToken
   * @param {object} options
   * @param {object} options.adapterOptions
   * @return {Promise}
   */
  createWorkerLed(workerGeneratedAuthToken, options = { adapterOptions: {} }) {
    const defaultAdapterOptions = {
      method: 'create:worker-led',
      workerGeneratedAuthToken,
    };
    return super.save({
      ...options,
      adapterOptions: {
        ...defaultAdapterOptions,
        ...options.adapterOptions,
      },
    });
  }

  /**
   * Method to set api tags on the worker.
   * @param {object} apiTags
   * @return {Promise}
   */
  setApiTags(apiTags) {
    return this.save({
      adapterOptions: { method: 'set-worker-tags', apiTags },
    });
  }
}
