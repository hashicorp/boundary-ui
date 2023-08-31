/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class ScopesScopeTargetsTargetEnableSessionRecordingIndexRoute extends Route {
  // =services
  @service store;
  @service router;

  // =methods

  /**
   * Returns the current target
   * @return {TargetModel}
   */

  model() {
    return this.modelFor('scopes.scope.targets.target');
  }

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
  // =actions

  /**
   * Reset the selected storage bucket and redirect to target
   * @param {TargetModel} target
   */
  @action
  cancel(target) {
    const { id } = target;
    target.rollbackAttributes();
    this.router.replaceWith('scopes.scope.targets.target', id);
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
