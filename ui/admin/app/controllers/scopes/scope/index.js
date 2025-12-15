/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller from '@ember/controller';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { loading } from 'ember-loading';
import { confirm } from 'core/decorators/confirm';
import { notifySuccess, notifyError } from 'core/decorators/notify';

export default class ScopesScopeIndexController extends Controller {
  // =services

  @service router;

  //= actions

  /**
   * Rollback changes on scope.
   * @param {ScopeModel} scope
   */
  @action
  cancel(scope) {
    const { isNew } = scope;
    scope.rollbackAttributes();
    if (isNew) this.router.transitionTo('scopes.scope');
  }

  /**
   * Handle save scope.
   * @param {ScopeModel} scope
   */
  @action
  @loading
  @notifyError(({ message }) => message)
  @notifySuccess(({ isNew }) =>
    isNew ? 'notifications.create-success' : 'notifications.save-success',
  )
  async save(scope) {
    const { isNew } = scope;
    await scope.save();
    await this.router.transitionTo('scopes.scope.edit', scope);
    if (isNew) this.router.refresh();
  }

  /**
   * Deletes the scope and redirects to index.
   * @param {ScopeModel} scope
   */
  @action
  @loading
  @confirm('questions.delete-confirm')
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('notifications.delete-success')
  async delete(scope) {
    const { scopeID } = scope;
    await scope.destroyRecord();
    this.router.replaceWith('scopes.scope.scopes', scopeID);
  }

  /**
   * Deletes the scope and redirects to index.
   * @param {ScopeModel} scope
   */
  @action
  @loading
  @confirm('resources.policy.questions.detach')
  @notifyError(({ message }) => message)
  @notifySuccess('resources.policy.messages.detach')
  async detachStoragePolicy(scope) {
    const { storage_policy_id } = scope;
    scope.storage_policy_id = '';
    await scope.detachStoragePolicy(storage_policy_id);
  }
}
