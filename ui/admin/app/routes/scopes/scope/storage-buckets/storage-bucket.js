/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ScopesScopeStorageBucketsStorageBucketRoute extends Route {
  // =services

  @service store;
  @service can;
  @service router;

  // =methods

  /**
   * Load a storage bucket in current scope.
   * @param {object} params
   * @param {string} params.storage_bucket_id
   * @return {StorageBucketModel}
   */
  async model({ storage_bucket_id }) {
    return this.store.findRecord('storage-bucket', storage_bucket_id);
  }

  redirect(storageBucket) {
    const scope = this.modelFor('scopes.scope');
    if (
      this.can.cannot('read storage-bucket', storageBucket, {
        resource_id: storageBucket.scopeID,
        collection_id: scope.id,
      })
    ) {
      this.router.transitionTo(
        'scopes.scope.storage-buckets.storage-bucket',
        storageBucket.scopeID,
        storageBucket.id
      );
    }
  }
}
