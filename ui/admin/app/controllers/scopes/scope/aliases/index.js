/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { loading } from 'ember-loading';
import { confirm } from 'core/decorators/confirm';
import { notifySuccess, notifyError } from 'core/decorators/notify';

export default class ScopesScopeAliasesIndexController extends Controller {
  // =services
  @service can;
  @service router;
  // =actions

  /**
   * Rollback changes on an alias.
   * @param {AliasModel} alias
   */
  @action
  async cancel(alias) {
    const { isNew } = alias;
    alias.rollbackAttributes();
    if (isNew) await this.router.transitionTo('scopes.scope.aliases');
  }

  /**
   * Save an alias in current scope.
   * @param {AliasModel} alias
   */
  @action
  @loading
  @notifyError(({ message }) => message)
  @notifySuccess(({ isNew }) =>
    isNew ? 'notifications.create-success' : 'notifications.save-success',
  )
  async save(alias) {
    await alias.save();
    if (this.can.can('read model', alias)) {
      await this.router.transitionTo('scopes.scope.aliases.alias', alias);
    } else {
      await this.router.transitionTo('scopes.scope.aliases');
    }
    await this.router.refresh();
  }

  /**
   * Delete an alias in current scope
   *  @param {AliasModel} alias
   */
  @action
  @loading
  @confirm('questions.delete-confirm')
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('notifications.delete-success')
  async delete(alias) {
    await alias.destroyRecord();
  }
}
