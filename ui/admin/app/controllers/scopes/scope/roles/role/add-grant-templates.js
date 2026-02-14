/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller from '@ember/controller';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { debounce } from 'core/decorators/debounce';

export default class ScopesScopeRolesRoleAddGrantTemplatesController extends Controller {
  // =services

  @service router;
  @service intl;

  // =attributes

  queryParams = ['search', 'page', 'pageSize'];
  @tracked search;
  @tracked page = 1;
  @tracked pageSize = 10;

  // =actions

  /**
   * Add grant templates to the current role.
   * @param {RoleModel} role
   * @param {[string]} grantTemplates
   */
  @action
  async addGrantTemplates(role, grantTemplates) {
    // Add the grant templates to the role's grant_strings without saving yet
    // Note that we transition first to avoid a discard changes confirmation
    this.router.replaceWith('scopes.scope.roles.role.grants');
    role.grant_strings = [...role.grant_strings, ...grantTemplates];
  }

  /**
   * Redirect to role grants as if nothing ever happened.
   */
  @action
  cancel() {
    this.router.replaceWith('scopes.scope.roles.role.grants');
  }

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
}
