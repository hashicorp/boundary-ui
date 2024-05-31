/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { notifySuccess, notifyError } from 'core/decorators/notify';
import { loading } from 'ember-loading';

export default class ScopesScopeTargetsTargetManageAliasRoute extends Route {
  // =services

  @service store;
  @service router;
  // =methods

  /**
   * Creates a new unsaved alias.
   * @return {AliasModel}
   */
  async model({ alias_id }) {
    return this.store.findRecord('alias', alias_id, {
      reload: true,
    });
  }

  // =actions

  /**
   * Handle save
   * @param {AliasModel} alias
   */
  @action
  @loading
  @notifyError(({ message }) => message)
  @notifySuccess('notifications.save-success')
  async save(alias) {
    await alias.save();
    await this.router.refresh('scopes.scope.targets.target');
    this.router.transitionTo('scopes.scope.targets.target');
  }

  /**
   * Rollback changes on alias.
   * @param {AliasModel} alias
   */
  @action
  async cancel(alias) {
    alias.rollbackAttributes();
    await this.router.transitionTo('scopes.scope.targets.target');
  }
}
