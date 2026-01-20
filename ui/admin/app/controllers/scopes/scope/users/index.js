/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller from '@ember/controller';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { loading } from 'ember-loading';
import { confirm } from 'core/decorators/confirm';
import { notifySuccess, notifyError } from 'core/decorators/notify';

export default class ScopesScopeUsersIndexController extends Controller {
  // =services

  @service can;
  @service intl;
  @service router;
  @tracked sortAttribute;
  @tracked sortDirection;

  // =attributes

  queryParams = [
    'search',
    'page',
    'pageSize',
    'sortAttribute',
    'sortDirection',
  ];

  @tracked search;
  @tracked page = 1;
  @tracked pageSize = 10;

  /**
   * If can list (at least): return default welcome message.
   * If can create (only): return create-but-not-list welcome message.
   * If can neither list nor create: return neither-list-nor-create welcome message
   * @type {string}
   */
  get messageDescription() {
    const canList = this.can.can('list model', this.scope, {
      collection: 'users',
    });
    const canCreate = this.can.can('create model', this.scope, {
      collection: 'users',
    });
    const resource = this.intl.t('resources.user.title_plural');
    let description = 'descriptions.neither-list-nor-create';

    if (canList) {
      description = 'resources.user.description';
    } else if (canCreate) {
      description = 'descriptions.create-but-not-list';
    }

    return this.intl.t(description, { resource });
  }

  // =methods

  /**
   * Handles input on each keystroke and the search queryParam
   * @param {object} event
   */
  @action
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
      this.router.transitionTo('scopes.scope.users');
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

  @action
  sortBy(attribute, direction) {
    this.sortAttribute = attribute;
    this.sortDirection = direction;
    // Reset to the first page when changing sort
    this.page = 1;
  }
}
