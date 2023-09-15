/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ScopesScopeStorageBucketsStorageBucketRoute extends Route {
  // =services

  @service store;

  // =methods

  /**
   * Load a storage bucket in current scope.
   * @param {object} params
   * @param {string} params.storage_bucket_id
   * @return {StorageBucketModel}
   */
  model({ storage_bucket_id }) {
    return this.store.findRecord('storage-bucket', storage_bucket_id);
  }
}
