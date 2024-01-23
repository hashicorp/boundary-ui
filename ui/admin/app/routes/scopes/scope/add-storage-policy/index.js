/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { loading } from 'ember-loading';
import { notifySuccess, notifyError } from 'core/decorators/notify';

export default class ScopesScopeAddStoragePolicyIndexRoute extends Route {
  // =services
  @service store;
  @service router;

  // =methods

  /**
   * Load policies from current scope
   * @param {Model} model
   */
  async afterModel() {
    const { id: scope_id } = this.modelFor('scopes.scope');
    const currentScopePolicies = await this.store.query('policy', {
      scope_id,
    });
    if (scope_id === 'global') {
      // Global scope should only list policies from its scope
      this.policyList = currentScopePolicies;
    } else {
      // Org scope should list both global and org scope policies
      const globalScopePolicies = await this.store.query('policy', {
        scope_id: 'global',
      });

      this.policyList = [...globalScopePolicies, ...currentScopePolicies];
    }
  }

  /**
   * Adds `policyList` to the context.
   * @param {Controller} controller
   */
  setupController(controller) {
    super.setupController(...arguments);
    controller.set('policyList', this.policyList);
  }

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
   * @param {PolicyModel} policy
   */
  @action
  cancel(scope) {
    scope.rollbackAttributes();
    this.router.transitionTo('scopes.scope.edit', scope);
  }
}
