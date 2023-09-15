/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { loading } from 'ember-loading';
import { confirm } from 'core/decorators/confirm';
import { notifySuccess, notifyError } from 'core/decorators/notify';

export default class ScopesScopeStorageBucketsRoute extends Route {
  // =services

  @service store;
  @service session;
  @service can;
  @service router;

  // =attributes

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
      storageBucket
    );
    this.refresh();
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
   * Updates type of credential
   * @param {string} credentialType
   */
  @action
  changeType(credentialType) {
    this.router.replaceWith({ queryParams: { credentialType } });
  }
}
