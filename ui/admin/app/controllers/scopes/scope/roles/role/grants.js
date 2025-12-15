/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller, { inject as controller } from '@ember/controller';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { loading } from 'ember-loading';
import { notifySuccess, notifyError } from 'core/decorators/notify';

export default class ScopesScopeRolesRoleGrantsController extends Controller {
  @controller('scopes/scope/roles/index') roles;

  // =services

  @service router;

  // =actions

  /**
   * Adds a new grant to the role at the beginning of the grants list.
   * Grant creation is not immediately permanent; users may rollback the change
   * via "cancel" or commit it via "save".
   * @param {RoleModel} role
   * @param {string} grantString
   */
  @action
  addGrant(role, grantString) {
    role.grant_strings = [grantString].concat(role.grant_strings);
  }

  /**
   * Removes a grant from the role.  Grant removal is not immediately permanent;
   * users may rollback the change via "cancel" or commit it via "save".
   * @param {RoleModel} role
   * @param {string} grantString
   */
  @action
  removeGrant(role, grantString) {
    role.grant_strings = role.grant_strings.filter(
      (str) => str !== grantString,
    );
  }

  /**
   * Save a role.
   * @param {RoleModel} role
   * @param {[string]} grantStrings
   */
  @action
  @loading
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('notifications.save-success')
  async save(role, grantStrings) {
    await role.saveGrantStrings(grantStrings);
  }

  /**
   * Rollback changes on a role.
   * @param {RoleModel} role
   */
  @action
  async cancel(role) {
    role.rollbackAttributes();
    await this.router.refresh('scopes.scope.roles.role');
  }
}
