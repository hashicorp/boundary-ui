/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller, { inject as controller } from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { loading } from 'ember-loading';
import { tracked } from '@glimmer/tracking';
import { debounce } from 'core/decorators/debounce';
import { notifySuccess, notifyError } from 'core/decorators/notify';

export default class ScopesScopeRolesRoleManageScopesManageOrgProjectsController extends Controller {
  @controller('scopes/scope/roles/role/manage-scopes/index') manageScopes;

  // =services

  @service router;

  // =attributes

  queryParams = ['search', 'page', 'pageSize'];

  @tracked search = '';
  @tracked page = 1;
  @tracked pageSize = 10;

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
   * Save grant scope IDs to current role via the API.
   * @param {RoleModel} role
   * @param {[string]} grantScopeIDs
   */
  @action
  @loading
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('notifications.add-success')
  async setGrantScopes(role, grantScopeIDs) {
    await role.setGrantScopes(grantScopeIDs);
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
   */
  @action
  cancel(role) {
    if (role.scope.isGlobal) {
      this.router.replaceWith(
        'scopes.scope.roles.role.manage-scopes.manage-custom-scopes',
      );
    } else {
      this.router.replaceWith('scopes.scope.roles.role.manage-scopes');
    }
  }
}
