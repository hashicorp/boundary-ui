/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller from '@ember/controller';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { loading } from 'ember-loading';
import { notifySuccess, notifyError } from 'core/decorators/notify';

export default class ScopesScopeRolesRoleEditGrantsController extends Controller {
  @service router;

  /**
   * Save grant strings on a role.
   * @param {RoleModel} role
   * @param {[string]} grantStrings
   */
  @action
  @loading
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('notifications.save-success')
  async save(role, grantStrings) {
    await role.saveGrantStrings(grantStrings);
    this.router.replaceWith('scopes.scope.roles.role.grants');
  }

  /**
   * Rollback changes on a role.
   * @param {RoleModel} role
   */
  @action
  async cancel(role) {
    role.rollbackAttributes();
    this.router.replaceWith('scopes.scope.roles.role.grants');
  }
}
