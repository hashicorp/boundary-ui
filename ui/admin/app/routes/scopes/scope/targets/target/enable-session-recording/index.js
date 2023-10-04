/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ScopesScopeTargetsTargetEnableSessionRecordingIndexRoute extends Route {
  // =services
  @service store;
  @service router;

  // =methods

  /**
   * Load storage buckets from target's parent's scope and global scope
   * @param {Model} model
   */
  async afterModel() {
    const { scopeID: scope_id } = this.modelFor('scopes.scope');

    //fetch storage buckets from global scope
    const globalScopeStorageBuckets = await this.store.query('storage-bucket', {
      scope_id: 'global',
    });

    //fetch storage buckets from target's parent's scope
    const orgScopeStorageBuckets = await this.store.query('storage-bucket', {
      scope_id,
    });

    const storageBucketList = [
      ...globalScopeStorageBuckets,
      ...orgScopeStorageBuckets,
    ];
    this.storageBucketList = storageBucketList;
  }

  /**
   * Adds `storageBucketList` to the context.
   * @param {Controller} controller
   */
  setupController(controller) {
    super.setupController(...arguments);
    controller.set('storageBucketList', this.storageBucketList);
  }
}
