/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';
import {
  TYPE_STORAGE_BUCKET_PLUGIN,
  TYPE_STORAGE_BUCKET_PLUGIN_AWS_S3,
} from 'api/models/storage-bucket';

export default class ScopesScopeStorageBucketsNewRoute extends Route {
  // =services

  @service store;
  @service abilities;
  @service router;

  // =attributes
  queryParams = {
    compositeType: {
      refreshModel: true,
    },
  };

  // =methods

  /**
   * Redirect to parent route when scope does not have create authorized action.
   */
  beforeModel() {
    const scopeModel = this.modelFor('scopes.scope');
    if (
      this.abilities.cannot('create scope', scopeModel, {
        collection: 'storage-buckets',
      })
    ) {
      this.router.replaceWith('scopes.scope.storage-buckets');
    }
  }

  /**
   * Creates a new unsaved storage bucket.
   * Also rollback/destroy any new, unsaved instances from this route before
   * creating another, but reuse name/description/other fields if available.
   * @return {StorageBucket}
   */
  model({ compositeType = TYPE_STORAGE_BUCKET_PLUGIN_AWS_S3 }) {
    let name,
      description,
      scope,
      bucket_name,
      bucket_prefix,
      region,
      worker_filter;

    if (this.currentModel?.isNew) {
      ({
        name,
        description,
        scope,
        bucket_name,
        bucket_prefix,
        region,
        worker_filter,
      } = this.currentModel);
      this.currentModel.rollbackAttributes();
    }

    const record = this.store.createRecord('storage-bucket', {
      type: TYPE_STORAGE_BUCKET_PLUGIN,
      compositeType,
      name,
      description,
      scope,
      bucket_name,
      bucket_prefix,
      region,
      worker_filter,
    });
    return record;
  }

  async afterModel() {
    if (!this.scopes) {
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
