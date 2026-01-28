/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';
import {
  TYPE_STORAGE_BUCKET_PLUGIN,
  TYPE_STORAGE_BUCKET_PLUGIN_AWS_S3,
} from 'api/models/storage-bucket';

export default class ScopesScopeTargetsTargetEnableSessionRecordingCreateStorageBucketRoute extends Route {
  // =services

  @service store;

  // =methods

  /**
   * Creates a new unsaved storage bucket.
   * @return {StorageBucket}
   */
  model() {
    const scopeModel = this.store.peekRecord('scope', 'global');
    const record = this.store.createRecord('storage-bucket', {
      type: TYPE_STORAGE_BUCKET_PLUGIN,
      compositeType: TYPE_STORAGE_BUCKET_PLUGIN_AWS_S3,
    });
    record.scopeModel = scopeModel;
    return record;
  }

  async afterModel() {
    let scopes;
    const orgScopes = (
      await this.store.query('scope', {
        scope_id: 'global',
        query: { filters: { scope_id: [{ equals: 'global' }] } },
      })
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
