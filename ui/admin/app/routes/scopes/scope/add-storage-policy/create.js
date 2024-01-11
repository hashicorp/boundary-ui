/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { TYPE_POLICY } from 'api/models/policy';
import { action } from '@ember/object';
import { notifySuccess, notifyError } from 'core/decorators/notify';
import { loading } from 'ember-loading';

export default class ScopesScopeAddStoragePolicyCreateRoute extends Route {
  // =services

  @service store;
  @service router;
  // =methods

  /**
   * Creates a new unsaved policy.
   * @return {Policy}
   */
  model() {
    const scopeModel = this.store.peekRecord('scope', 'global');
    const record = this.store.createRecord('policy', {
      type: TYPE_POLICY,
    });
    record.scopeModel = scopeModel;
    return record;
  }

  // async afterModel() {
  //   let scopes;
  //   const orgScopes = (
  //     await this.store.query('scope', { scope_id: 'global' })
  //   ).map((scope) => ({ model: scope }));
  //   scopes = [
  //     { model: this.store.peekRecord('scope', 'global') },
  //     ...orgScopes,
  //   ];
  //   this.scopes = scopes;
  // }

  /**
   * Adds available global and org scopes to the context.
   * @param {Controller} controller
   */
  // setupController(controller) {
  //   super.setupController(...arguments);
  //   controller.set('scopes', this.scopes);
  // }

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
    console.log(policy, 'POLICY FROM CREATE');
    await policy.save();
    await this.router.transitionTo('scopes.scope.add-storage-policy');
    this.refresh();
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
