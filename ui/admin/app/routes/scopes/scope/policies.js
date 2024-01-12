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

export default class ScopesScopePoliciesRoute extends Route {
  // =services

  @service store;
  @service session;
  @service can;
  @service router;

  // =methods

  /**
   * If arriving here unauthenticated, redirect to index for further processing.
   */
  beforeModel() {
    if (!this.session.isAuthenticated) this.router.transitionTo('index');
  }

  /**
   * Load all storage policies under current scope
   * @return {Promise<[PolicyModel]>}
   */
  async model() {
    const scope = this.modelFor('scopes.scope');
    const { id: scope_id } = scope;

    if (
      this.can.can('list model', scope, {
        collection: 'policies',
      })
    ) {
      return this.store.query('policy', { scope_id });
    }
  }

  //actions

  /**
   * Rollback changes on a policy.
   * @param {PolicyModel} policy
   */
  @action
  cancel(policy) {
    const { isNew } = policy;
    policy.rollbackAttributes();
    if (isNew) this.router.transitionTo('scopes.scope.policies');
  }

  /**
   * Save a policy in current scope.
   * @param {PolicyModel} policy
   */
  @action
  @loading
  @notifyError(({ message }) => message)
  @notifySuccess('notifications.save-success')
  async save(policy) {
    await policy.save();
    await this.router.transitionTo('scopes.scope.policies.policy', policy);

    this.refresh();
  }
  /**
   * Deletes the policy.
   * @param {PolicyModel} policy
   */
  @action
  @loading
  @confirm('questions.delete-confirm')
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('notifications.delete-success')
  async delete(policy) {
    await policy.destroyRecord();
  }
}
