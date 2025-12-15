/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller from '@ember/controller';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { loading } from 'ember-loading';
import { notifySuccess, notifyError } from 'core/decorators/notify';

export default class ScopesScopeRolesRoleManageScopesIndexController extends Controller {
  // =services

  @service router;

  // =attributes

  showCheckIcon = false;

  // =actions

  /**
   * Save grant scope IDs to current role via the API.
   * @param {RoleModel} role
   */
  @action
  @loading
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('resources.role.scope.messages.manage-scopes.success')
  async setGrantScopes(role) {
    await role.setGrantScopes(role.grant_scope_ids);
    this.router.replaceWith('scopes.scope.roles.role.scopes');
  }

  /**
   * Redirect to role scopes as if nothing ever happened.
   * @param {RoleModel} role
   */
  @action
  cancel(role) {
    role.rollbackAttributes();
    this.router.replaceWith('scopes.scope.roles.role.scopes');
  }
}
