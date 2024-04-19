/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { loading } from 'ember-loading';
import { notifySuccess, notifyError } from 'core/decorators/notify';
import { tracked } from '@glimmer/tracking';

export default class ScopesScopeAliasesIndexController extends Controller {
  // =services
  @service can;
  @service router;

  // =attributes
  @tracked showModal = false;
  @tracked selectedAlias;
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
   * Handles modal visibility and sets the destination_id to a tracked variable so we can handle the clear button visibility on the modal
   */
  @action
  toggleModal(alias) {
    this.showModal = !this.showModal;
    this.selectedAlias = alias;
  }

  /**
   * Remove destaination_id from alias
   * @param {AliasModel} alias
   */
  @action
  @loading
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('notifications.clear-success')
  async clearAlias(alias) {
    this.showModal = false;
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
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('notifications.delete-success')
  async deleteAlias(alias) {
    await alias.destroyRecord();
    this.showModal = false;
    await this.router.replaceWith('scopes.scope.aliases');
    await this.router.refresh();
  }
}
