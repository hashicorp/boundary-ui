/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import {
  TYPE_STORAGE_BUCKET_PLUGIN,
  TYPE_STORAGE_BUCKET_PLUGIN_AWS_S3,
} from 'api/models/storage-bucket';

export default class ScopesScopeStorageBucketsNewRoute extends Route {
  // =services

  @service store;

  // =methods

  /**
   * Creates a new unsaved storage bucket.
   * Also rollback/destroy any new, unsaved instances from this route before
   * creating another, but reuse name/description/other fields if available.
   * @return {StorageBucket}
   */
  model() {
    const scopeModel = this.store.peekRecord('scope', 'global');
    let name, description, scope, bucket_name, bucket_prefix, region;
    if (this.currentModel?.isNew) {
      ({ name, description, scope, bucket_name, bucket_prefix, region } =
        this.currentModel);
      this.currentModel.rollbackAttributes();
    }
    const record = this.store.createRecord('storage-bucket', {
      type: TYPE_STORAGE_BUCKET_PLUGIN,
      compositeType: TYPE_STORAGE_BUCKET_PLUGIN_AWS_S3,
      name,
      description,
      scope,
      bucket_name,
      bucket_prefix,
      region,
    });
    record.scopeModel = scopeModel;
    return record;
  }

  async afterModel() {
    let scopes;
    const orgScopes = (
      await this.store.query('scope', { scope_id: 'global' })
    ).map((scope) => ({ model: scope }));
    scopes = [
      { model: this.store.peekRecord('scope', 'global') },
      ...orgScopes,
    ];
    this.scopes = scopes;
  }

  /**
   * Adds available global and org scopes to the context.
   * @param {Controller} controller
   */
  setupController(controller) {
    super.setupController(...arguments);
    controller.set('scopes', this.scopes);
  }
}
