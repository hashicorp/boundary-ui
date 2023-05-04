/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
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
   * Returns the number of config tags present on the worker.
   * @type {number}
   */
  get tagCount() {
    if (!this.config_tags) {
      return 0;
    }

    return Object.values(this.config_tags).reduce(
      (previousCount, currentTags) => previousCount + currentTags.length,
      0
    );
  }

  /**
   * Returns the config tags as an array of key/value pair objects.
   * @type {[object]}
   */
  getConfigTagList() {
    if (!this.config_tags) {
      return null;
    }

    return Object.entries(this.config_tags).flatMap(([key, value]) =>
      value.map((tag) => ({ key, value: tag }))
    );
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
}
