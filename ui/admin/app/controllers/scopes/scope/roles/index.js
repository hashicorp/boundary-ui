/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { loading } from 'ember-loading';
import { tracked } from '@glimmer/tracking';
import { debounce } from 'core/decorators/debounce';
import { confirm } from 'core/decorators/confirm';
import { notifySuccess, notifyError } from 'core/decorators/notify';
import { GRANT_SCOPE_THIS } from 'api/models/role';

export default class ScopesScopeRolesIndexController extends Controller {
  // =services

  @service can;
  @service intl;
  @service router;

  // =attributes

  queryParams = ['search', 'page', 'pageSize'];

  @tracked search = '';
  @tracked page = 1;
  @tracked pageSize = 10;

  grantScopeThis = GRANT_SCOPE_THIS;

  /**
   * If can list (at least): return default welcome message.
   * If can create (only): return create-but-not-list welcome message.
   * If can neither list nor create: return neither-list-nor-create welcome message
   * @type {string}
   */
  get messageDescription() {
    let description;
    if (this.can.can('list model', this.scope, { collection: 'roles' })) {
      description = 'resources.role.description';
    } else if (
      this.can.can('create model', this.scope, { collection: 'roles' })
    ) {
      description = 'descriptions.create-but-not-list';
    } else {
      description = 'descriptions.neither-list-nor-create';
    }
    return this.intl.t(description, {
      resource: this.intl.t('resources.role.title_plural'),
    });
  }

  // =actions

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

  /**
   * Rollback changes on an role.
   * @param {RoleModel} role
   */
  @action
  cancel(role) {
    const { isNew } = role;
    role.rollbackAttributes();
    if (isNew) this.router.transitionTo('scopes.scope.roles');
  }

  /**
   * Save an role in current scope.
   * @param {RoleModel} role
   */
  @action
  @loading
  @notifyError(({ message }) => message)
  @notifySuccess(({ isNew }) =>
    isNew ? 'notifications.create-success' : 'notifications.save-success',
  )
  async save(role) {
    await role.save();
    if (this.can.can('read model', role)) {
      await this.router.transitionTo('scopes.scope.roles.role', role);
    } else {
      await this.router.transitionTo('scopes.scope.roles');
    }
    await this.router.refresh();
  }

  /**
   * Delete role in current scope and redirect to index.
   * @param {RoleModel} role
   */
  @action
  @loading
  @confirm('questions.delete-confirm')
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('notifications.delete-success')
  async delete(role) {
    await role.destroyRecord();
    this.router.replaceWith('scopes.scope.roles');
    await this.router.refresh();
  }

  /**
   * Remove a principal from the current role and redirect to principals index.
   * @param {RoleModel} role
   * @param {UserModel, GroupModel, ManagedGroupModel} principal
   */
  @action
  @loading
  @confirm('questions.remove-confirm')
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('notifications.remove-success')
  async removePrincipal(role, principal) {
    await role.removePrincipal(principal.id);
    await this.router.refresh();
  }
}
