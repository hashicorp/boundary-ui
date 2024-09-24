/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { loading } from 'ember-loading';
import { debounce } from 'core/decorators/debounce';
import { notifySuccess, notifyError } from 'core/decorators/notify';
import { confirm } from 'core/decorators/confirm';

export default class ScopesScopeAliasesIndexController extends Controller {
  // =services

  @service can;
  @service router;

  // =attributes

  queryParams = ['search', 'page', 'pageSize'];

  @tracked search;
  @tracked page = 1;
  @tracked pageSize = 10;

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
   * Remove destination_id from alias
   * @param {AliasModel} alias
   */
  @action
  @loading
  @confirm('questions.clear-confirm')
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('notifications.clear-success')
  async clearAlias(alias) {
    alias.destination_id = '';
    await alias.save();
    await this.router.refresh();
  }

  /**
   * Delete an alias
   * @param {AliasModel} alias
   */
  @action
  @loading
  @confirm('resources.alias.messages.delete')
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('notifications.delete-success')
  async deleteAlias(alias) {
    await alias.destroyRecord();
    await this.router.replaceWith('scopes.scope.aliases');
    await this.router.refresh();
  }

  /**
   * Handles input on each keystroke and the search queryParam
   * @param {object} event
   */
  @action
  @debounce(250)
  handleSearchInput(event) {
    const { value } = event.target;
    this.search = value;
    this.page = 1;
  }
}
