/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { loading } from 'ember-loading';
import { notifySuccess, notifyError } from 'core/decorators/notify';

export default class ScopesScopeRolesRoleAddPrincipalsController extends Controller {
  // =services

  @service router;

  // =attributes

  /**
   * Returns a flat array of scopes, sorted and "grouped by" parent scope,
   * beginning with global.
   */
  get flatSortedScopes() {
    const { scopes } = this.model;
    const global = scopes.find((scope) => scope.isGlobal);
    const orgsAndProjects = scopes
      .filter((scope) => scope.isOrg)
      .map((org) => [
        org,
        ...scopes.filter((scope) => scope.scopeID === org.id),
      ]);
    const sorted = [global, ...orgsAndProjects].flat();
    return sorted;
  }

  // =actions

  /**
   * Save principal IDs to current role via the API.
   * @param {RoleModel} role
   * @param {[string]} principalIDs
   */
  @action
  @loading
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('notifications.add-success')
  async addPrincipals(role, principalIDs) {
    await role.addPrincipals(principalIDs);
    this.router.replaceWith('scopes.scope.roles.role.principals');
  }

  /**
   * Redirect to role principals as if nothing ever happened.
   */
  @action
  cancel() {
    this.router.replaceWith('scopes.scope.roles.role.principals');
  }

  /**
   * Calls filterBy action located in the route.
   * @param {string} field
   * @param {[ScopeModel]} value
   */
  @action
  callFilterBy(field, value) {
    this.send('filterBy', field, value);
  }

  /**
   * Calls clearAllFilters action located in the route.
   */
  @action
  callClearAllFilters() {
    this.send('clearAllFilters');
  }
}
