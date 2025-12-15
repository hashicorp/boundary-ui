/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller, { inject as controller } from '@ember/controller';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { loading } from 'ember-loading';
import { tracked } from '@glimmer/tracking';
import { notifySuccess, notifyError } from 'core/decorators/notify';

export default class ScopesScopeRolesRoleManageScopesManageOrgProjectsController extends Controller {
  @controller('scopes/scope/roles/role/manage-scopes/index') manageScopes;

  // =services

  @service router;

  // =attributes

  queryParams = ['search', 'page', 'pageSize'];

  @tracked search;
  @tracked page = 1;
  @tracked pageSize = 10;

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
   * Save grant scope IDs to current role via the API.
   * @param {RoleModel} role
   */
  @action
  @loading
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('resources.role.scope.messages.manage-org-projects.success')
  async setGrantScopes(role) {
    await role.setGrantScopes(role.grant_scope_ids);
    this.manageScopes.showCheckIcon = true;
    if (role.scope.isGlobal) {
      this.router.replaceWith(
        'scopes.scope.roles.role.manage-scopes.manage-custom-scopes',
      );
    } else {
      this.router.replaceWith('scopes.scope.roles.role.manage-scopes');
    }
  }

  /**
   * Redirect to previous as if nothing ever happened.
   * @param {RoleModel} role
   */
  @action
  cancel(role) {
    role.rollbackAttributes();
    if (role.scope.isGlobal) {
      this.router.replaceWith(
        'scopes.scope.roles.role.manage-scopes.manage-custom-scopes',
      );
    } else {
      this.router.replaceWith('scopes.scope.roles.role.manage-scopes');
    }
  }
}
