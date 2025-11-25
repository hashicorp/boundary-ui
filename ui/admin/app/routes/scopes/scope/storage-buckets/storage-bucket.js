/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ScopesScopeStorageBucketsStorageBucketRoute extends Route {
  // =services

  @service store;
  @service abilities;
  @service router;

  // =methods

  /**
   * Load a storage bucket in current scope.
   * @param {object} params
   * @param {string} params.storage_bucket_id
   * @return {Promise{StorageBucketModel}}
   */
  async model({ storage_bucket_id }) {
    return this.store.findRecord('storage-bucket', storage_bucket_id, {
      reload: true,
    });
  }

  /**
   * Redirects to route with correct scope id if incorrect.
   * @param {StorageBucketModel} storageBucket
   */
  redirect(storageBucket) {
    const scope = this.modelFor('scopes.scope');
    if (!scope.isGlobal && storageBucket.scopeID !== scope.id) {
      this.router.replaceWith(
        'scopes.scope.storage-buckets.storage-bucket',
        storageBucket.scopeID,
        storageBucket.id,
      );
    }
  }
}
