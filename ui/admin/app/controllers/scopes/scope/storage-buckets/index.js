/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller from '@ember/controller';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { loading } from 'ember-loading';
import { confirm } from 'core/decorators/confirm';
import { notifySuccess, notifyError } from 'core/decorators/notify';
import {
  TYPE_CREDENTIAL_STATIC,
  TYPE_CREDENTIAL_DYNAMIC,
} from 'api/models/storage-bucket';

export default class ScopesScopeStorageBucketsIndexController extends Controller {
  // =services

  @service abilities;
  @service intl;
  @service router;

  // =attributes

  /**
   * If can list (at least): return default welcome message.
   * If can create (only): return create-but-not-list welcome message.
   * If can neither list nor create: return neither-list-nor-create welcome message
   * @type {string}
   */
  get messageDescription() {
    const canList = this.abilities.can('list scope', this.scope, {
      collection: 'storage-buckets',
    });
    const canCreate = this.abilities.can('create scope', this.scope, {
      collection: 'storage-buckets',
    });
    const resource = this.intl.t('resources.storage-bucket.title_plural');
    let description = 'descriptions.neither-list-nor-create';

    if (canList) {
      description = 'resources.storage-bucket.messages.none.description';
    } else if (canCreate) {
      description = 'descriptions.create-but-not-list';
    }

    return this.intl.t(description, { resource });
  }

  /**
   * Generates one empty role_tags row for storage bucket when the field is empty.
   * @param {storageBucketModel} bucket
   */
  generateAwsRoleTagsRowIfEmpty(bucket) {
    // If role_tags is an empty array, add an empty row
    if (!bucket.role_tags || bucket.role_tags.length === 0) {
      bucket.role_tags = [{ key: '', value: '' }];
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
    // If the role_arn is empty, then the credential type should be static
    if (!storageBucket.role_arn) {
      storageBucket.credentialType = TYPE_CREDENTIAL_STATIC;
    }

    if (storageBucket.role_tags) {
      storageBucket.role_tags = storageBucket.role_tags.filter((item) =>
        item.key?.trim(),
      );
    }

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
    await this.router.replaceWith('scopes.scope.storage-buckets');
    await this.router.refresh();
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
   * Updates credential type
   * @param {object} storageBucket
   * @param {string} credentialType
   */
  @action
  changeCredentialType(storageBucket, credentialType) {
    storageBucket.credentialType = credentialType;

    if (credentialType === TYPE_CREDENTIAL_DYNAMIC) {
      this.generateAwsRoleTagsRowIfEmpty(storageBucket);
    }
  }

  /**
   * Changes the plugin type.
   * @param {string} pluginType
   */
  @action
  async changePluginType(pluginType) {
    await this.router.replaceWith({
      queryParams: { compositeType: pluginType },
    });
  }

  @action
  edit(storageBucket) {
    if (storageBucket.role_tags) {
      storageBucket.role_tags = structuredClone(storageBucket.role_tags);
    }

    if (storageBucket.credentialType === TYPE_CREDENTIAL_DYNAMIC) {
      this.generateAwsRoleTagsRowIfEmpty(storageBucket);
    }
  }
}
