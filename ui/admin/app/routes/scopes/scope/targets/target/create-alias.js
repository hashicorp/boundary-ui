/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { notifySuccess, notifyError } from 'core/decorators/notify';
import { loading } from 'ember-loading';
import { TYPE_ALIAS_TARGET } from 'api/models/alias';

export default class ScopesScopeTargetsTargetCreateAliasRoute extends Route {
  // =services

  @service store;
  @service router;
  // =methods

  /**
   * Creates a new unsaved alias.
   * @return {AliasModel}
   */
  model() {
    const scopeModel = this.store.peekRecord('scope', 'global');
    const record = this.store.createRecord('alias', {
      type: TYPE_ALIAS_TARGET,
    });
    record.scopeModel = scopeModel;
    return record;
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
    await this.router.transitionTo('scopes.scope.targets.target');
    this.router.refresh();
  }

  /**
   * Rollback changes on alias.
   * @param {AliasModel} alias
   */
  @action
  cancel(alias) {
    alias.rollbackAttributes();
    this.router.transitionTo('scopes.scope.targets.target');
  }
}
