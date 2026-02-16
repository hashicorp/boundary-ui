/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller from '@ember/controller';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { notifySuccess, notifyError } from 'core/decorators/notify';
import { loading } from 'ember-loading';

export default class ScopesScopeAddStoragePolicyCreateController extends Controller {
  // =services

  @service router;

  // =actions

  /**
   * Handle save
   * @param {PolicyModel} policy
   */
  @action
  @loading
  @notifyError(({ message }) => message)
  @notifySuccess('notifications.save-success')
  async save(policy) {
    await policy.save();
    await this.router.transitionTo('scopes.scope.add-storage-policy');
    await this.router.refresh();
  }

  /**
   * Rollback changes on policies.
   * @param {PolicyModel} policy
   */
  @action
  cancel(policy) {
    policy.rollbackAttributes();
    this.router.transitionTo('scopes.scope.add-storage-policy');
  }
}
