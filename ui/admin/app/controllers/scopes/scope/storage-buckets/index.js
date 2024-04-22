/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { loading } from 'ember-loading';
import { confirm } from 'core/decorators/confirm';
import { notifySuccess, notifyError } from 'core/decorators/notify';

export default class ScopesScopeStorageBucketsIndexController extends Controller {
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
      'scopes.scope.storage-buckets.storage-bucket',
      storageBucket,
    );
    await this.router.refresh();
  }

  /**
   * Deletes the storage bucket.
   * @param {StorageBucketModel} storageBucket
   */
  @action
  @loading
  @confirm('resources.storage-bucket.questions.delete-storage-bucket.message', {
    title: 'resources.storage-bucket.questions.delete-storage-bucket.title',
    confirm: 'resources.storage-bucket.actions.delete',
  })
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('notifications.delete-success')
  async delete(storageBucket) {
    await storageBucket.destroyRecord();
  }

  /**
   * Rollback changes on storage buckets.
   * @param {StorageBucketModel} storageBucket
   */
  @action
  cancel(storageBucket) {
    const { isNew } = storageBucket;
    storageBucket.rollbackAttributes();
    if (isNew) this.router.transitionTo('scopes.scope.storage-buckets');
  }

  /**
   * Updates credentil type
   * @param {object} storageBucket
   * @param {string} credentialType
   */
  @action
  changeCredentialType(storageBucket, credentialType) {
    storageBucket.credentialType = credentialType;
  }

  /**
   * Changes the plugin type.
   * @param {*} pluginType
   */
  @action
  async changePluginType(pluginType) {
    await this.router.replaceWith({
      queryParams: { compositeType: pluginType },
    });
  }
}
