/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller, { inject as controller } from '@ember/controller';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { loading } from 'core/decorators/loading';
import { tracked } from '@glimmer/tracking';
import { notifySuccess, notifyError } from 'core/decorators/notify';

export default class ScopesScopeRolesRoleManageScopesManageCustomScopesController extends Controller {
  @controller('scopes/scope/roles/role/manage-scopes/index') manageScopes;

  // =services

  @service router;

  // =attributes

  queryParams = ['search', { orgs: { type: 'array' } }, 'page', 'pageSize'];

  @tracked search;
  @tracked orgs = [];
  @tracked page = 1;
  @tracked pageSize = 10;

  /**
   * Returns unique org scopes from projects.
   * @returns {[object]}
   */
  get orgScopes() {
    const uniqueMap = new Map();
    this.model.allProjects.forEach(({ scope: { id, name } }) => {
      if (!uniqueMap.has(id)) {
        const orgName = name || id;
        uniqueMap.set(id, { id, name: orgName });
      }
    });
    return Array.from(uniqueMap.values());
  }

  /**
   * Returns the filters object used for displaying filter tags.
   * @type {object}
   */
  get filters() {
    return {
      allFilters: {
        orgs: this.orgScopes,
      },
      selectedFilters: {
        orgs: this.orgs,
      },
    };
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
   * Sets a query param to the value of selectedItems
   * and resets the page to 1.
   * @param {string} paramKey
   * @param {[string]} selectedItems
   */
  @action
  applyFilter(paramKey, selectedItems) {
    this[paramKey] = [...selectedItems];
    this.page = 1;
  }

  /**
   * Save grant scope IDs to current role via the API.
   * @param {RoleModel} role
   */
  @action
  @loading
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('resources.role.scope.messages.manage-custom-scopes.success')
  async setGrantScopes(role) {
    await role.setGrantScopes(role.grant_scope_ids);
    this.manageScopes.showCheckIcon = true;
    this.router.replaceWith('scopes.scope.roles.role.manage-scopes');
  }

  /**
   * Redirect to manage scopes as if nothing ever happened.
   * @param {RoleModel} role
   */
  @action
  cancel(role) {
    role.rollbackAttributes();
    this.router.replaceWith('scopes.scope.roles.role.manage-scopes');
  }
}
