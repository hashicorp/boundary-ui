/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { debounce } from 'core/decorators/debounce';
import { loading } from 'ember-loading';
import { confirm } from 'core/decorators/confirm';
import { notifySuccess, notifyError } from 'core/decorators/notify';

export default class ScopesScopeUsersIndexController extends Controller {
  // =services

  @service can;
  @service intl;
  @service router;

  // =attributes

  queryParams = ['search', 'page', 'pageSize'];

  @tracked search = '';
  @tracked page = 1;
  @tracked pageSize = 10;

  /**
   * If can list (at least): return default welcome message.
   * If can create (only): return create-but-not-list welcome message.
   * If can neither list nor create: return neither-list-nor-create welcome message
   * @type {string}
   */
  get messageDescription() {
    let description;
    if (this.can.can('list model', this.scope, { collection: 'users' })) {
      description = 'resources.user.description';
    } else if (
      this.can.can('create model', this.scope, { collection: 'users' })
    ) {
      description = 'descriptions.create-but-not-list';
    } else {
      description = 'descriptions.neither-list-nor-create';
    }
    return this.intl.t(description, {
      resource: this.intl.t('resources.user.title_plural'),
    });
  }

  // =methods

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

  // =actions

  /**
   * Rollback changes on an user.
   * @param {UserModel} user
   */
  @action
  cancel(user) {
    const { isNew } = user;
    user.rollbackAttributes();
    if (isNew) this.router.transitionTo('scopes.scope.users');
  }

  /**
   * Save an user in current scope.
   * @param {UserModel} user
   * @param {Event} e
   */
  @action
  @loading
  @notifyError(({ message }) => message)
  @notifySuccess(({ isNew }) =>
    isNew ? 'notifications.create-success' : 'notifications.save-success',
  )
  async save(user) {
    await user.save();
    if (this.can.can('read model', user)) {
      await this.router.transitionTo('scopes.scope.users.user', user);
    } else {
      await this.router.transitionTo('scopes.scope.users');
    }
    await this.router.refresh();
  }

  /**
   * Delete user in current scope and redirect to index.
   * @param {UserModel} user
   */
  @action
  @loading
  @confirm('questions.delete-confirm')
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('notifications.delete-success')
  async delete(user) {
    await user.destroyRecord();
    this.router.replaceWith('scopes.scope.users');
    await this.router.refresh();
  }

  /**
   * Remove an account from the current role and redirect to accounts index.
   * @param {UserModel} user
   * @param {AccountModel} account
   */
  @action
  @loading
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('notifications.remove-success')
  async removeAccount(user, account) {
    await user.removeAccount(account.id);
    await this.router.refresh();
  }
}
