/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { loading } from 'ember-loading';
import { confirm } from 'core/decorators/confirm';
import { notifySuccess, notifyError } from 'core/decorators/notify';

export default class ScopesScopeRolesRoute extends Route {
  // =services

  @service session;
  @service can;
  @service router;

  // =methods

  /**
   * If arriving here unauthenticated, redirect to index for further processing.
   */
  beforeModel() {
    if (!this.session.isAuthenticated) this.router.transitionTo('index');
  }

  // =actions

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
    this.refresh();
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
    this.refresh();
  }
}
