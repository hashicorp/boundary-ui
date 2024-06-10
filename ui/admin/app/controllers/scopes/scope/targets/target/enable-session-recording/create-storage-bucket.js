/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller, { inject as controller } from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { notifySuccess, notifyError } from 'core/decorators/notify';
import { loading } from 'ember-loading';

export default class ScopesScopeTargetsTargetEnableSessionRecordingCreateStorageBucketController extends Controller {
  @controller('scopes/scope/storage-buckets/index')
  storageBuckets;

  // =services

  @service router;

  // =actions

  /**
   * Handle save
   * @param {StorageBucketModel} storageBucket
   */
  @action
  @loading
  @notifyError(({ message }) => message)
  @notifySuccess('notifications.save-success')
  async save(storageBucket) {
    await storageBucket.save();
    await this.router.transitionTo(
      'scopes.scope.targets.target.enable-session-recording',
    );
    await this.router.refresh();
  }

  /**
   * Rollback changes on storage buckets.
   * @param {StorageBucketModel} storageBucket
   */
  @action
  cancel(storageBucket) {
    storageBucket.rollbackAttributes();
    this.router.transitionTo(
      'scopes.scope.targets.target.enable-session-recording',
    );
  }
}
