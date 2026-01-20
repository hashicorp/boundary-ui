/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller from '@ember/controller';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { loading } from 'ember-loading';
import { notifySuccess, notifyError } from 'core/decorators/notify';

export default class ScopesScopeAddStoragePolicyIndexController extends Controller {
  // =services

  @service router;

  // =actions

  /**
   * Deletes the scope and redirects to index.
   * @param {Model} scope
   */
  @action
  @loading
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('notifications.save-success')
  async attachStoragePolicy(scope) {
    const { storage_policy_id } = scope;
    if (storage_policy_id) {
      await scope.attachStoragePolicy(storage_policy_id);
    }
    await scope.save();
    await this.router.transitionTo('scopes.scope.edit', scope);
  }

  /**
   * Rollback changes on add storage policy.
   * @param {ScopeModel} scope
   */
  @action
  cancel(scope) {
    scope.rollbackAttributes();
    this.router.transitionTo('scopes.scope.edit', scope);
  }
}
