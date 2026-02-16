/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller from '@ember/controller';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { loading } from 'ember-loading';
import { tracked } from '@glimmer/tracking';
import { confirm } from 'core/decorators/confirm';
import { notifySuccess, notifyError } from 'core/decorators/notify';
import { GRANT_SCOPE_THIS } from 'api/models/role';

export default class ScopesScopeRolesIndexController extends Controller {
  // =services

  @service can;
  @service intl;
  @service router;

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
  @tracked sortAttribute;
  @tracked sortDirection;

  grantScopeThis = GRANT_SCOPE_THIS;

  /**
   * If can list (at least): return default welcome message.
   * If can create (only): return create-but-not-list welcome message.
   * If can neither list nor create: return neither-list-nor-create welcome message
   * @type {string}
   */
  get messageDescription() {
    const canList = this.can.can('list model', this.scope, {
      collection: 'roles',
    });
    const canCreate = this.can.can('create model', this.scope, {
      collection: 'roles',
    });
    const resource = this.intl.t('resources.role.title_plural');
    let description = 'descriptions.neither-list-nor-create';

    if (canList) {
      description = 'resources.role.description';
    } else if (canCreate) {
      description = 'descriptions.create-but-not-list';
    }

    return this.intl.t(description, { resource });
  }

  // =actions

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
      this.router.transitionTo('scopes.scope.roles');
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

  @action
  sortBy(attribute, direction) {
    this.sortAttribute = attribute;
    this.sortDirection = direction;
    this.page = 1;
  }
}
