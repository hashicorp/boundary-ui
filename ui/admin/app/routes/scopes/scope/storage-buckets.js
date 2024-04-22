/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ScopesScopeStorageBucketsRoute extends Route {
  // =services

  @service store;
  @service session;
  @service can;
  @service router;

  // =methods

  /**
   * If arriving here unauthenticated, redirect to index for further processing.
   */
  beforeModel() {
    if (!this.session.isAuthenticated) this.router.transitionTo('index');
  }

  /**
   * Load all storage buckets under global and org scopes.
   * @return {Promise<[StorageBucketModel]>}
   */
  async model() {
    const scope = this.modelFor('scopes.scope');
    const { id: scope_id } = scope;
    if (
      this.can.can('list scope', scope, {
        collection: 'storage-buckets',
      })
    ) {
      return this.store.query('storage-bucket', { scope_id, recursive: true });
    }
  }
}
