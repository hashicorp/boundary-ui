/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { loading } from 'ember-loading';
import { confirm } from 'core/decorators/confirm';
import { notifySuccess, notifyError } from 'core/decorators/notify';
import {
  TYPE_AUTH_METHOD_OIDC,
  TYPE_AUTH_METHOD_LDAP,
} from 'api/models/auth-method';

export default class ScopesScopeRolesRolePrincipalsRoute extends Route {
  // =services

  @service store;
  @service resourceFilterStore;

  // =methods

  /**
   * Returns users, groups and managed-groups associated with this role.
   * @param {object} params
   * @return {Promise{role, principals}}
   */
  async model() {
    const role = this.modelFor('scopes.scope.roles.role');
    // Fetch user principals.
    const users = await this.getUsers(role.userIDs);

    // Fetch group principals.
    const groups = await this.getGroups(role.groupIDs);

    // Fetch managedGroup principals.
    const managedGroups = await this.getManagedGroups(role.managedGroupIDs);

    // Merge polymorphic principals.
    const principals = [...users, ...groups, ...managedGroups];

    return { role, principals };
  }

  /**
   * Retrieves role principals of user type.
   * @param {array} ids
   * @return {Promise[UserModel]}
   */
  async getUsers(ids) {
    let users = [];
    if (ids?.length) {
      const query = { filters: { id: [] } };
      ids.forEach((id) => query.filters.id.push({ equals: id }));
      users = await this.store.query('user', {
        scope_id: 'global',
        recursive: true,
        query,
      });
    }
    return users;
  }

  /**
   * Retrieves role principals of group type.
   * @param {array} ids
   * @return {Promise[GroupModel]}
   */
  async getGroups(ids) {
    let groups = [];
    if (ids?.length) {
      const query = { filters: { id: [] } };
      ids.forEach((id) => query.filters.id.push({ equals: id }));
      groups = await this.store.query('group', {
        scope_id: 'global',
        recursive: true,
        query,
      });
    }
    return groups;
  }

  /**
   * Retrieves role principals of managed-group type.
   * @param {array} ids
   * @return {Promise[ManagedGroupModel]}
   */
  async getManagedGroups(ids) {
    let managedGroups = [];
    if (ids?.length) {
      // Collect all oidc and ldap type auth methods.
      const authMethods = await this.resourceFilterStore.queryBy(
        'auth-method',
        { type: [TYPE_AUTH_METHOD_OIDC, TYPE_AUTH_METHOD_LDAP] },
        { scope_id: 'global', recursive: true },
      );

      const nestedManagedGroups = await Promise.all(
        authMethods.map(({ id: auth_method_id }) =>
          this.resourceFilterStore.queryBy(
            'managed-group',
            { id: ids },
            { auth_method_id },
          ),
        ),
      );
      managedGroups = nestedManagedGroups.flat();
    }
    return managedGroups;
  }

  // =actions

  /**
   * Remove a principal from the current role and redirect to principals index.
   * @param {UserModel, GroupModel, ManagedGroupModel} principal
   */
  @action
  @loading
  @confirm('questions.remove-confirm')
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('notifications.remove-success')
  async removePrincipal(principal) {
    const role = this.modelFor('scopes.scope.roles.role');
    await role.removePrincipal(principal.id);
    this.refresh();
  }
}
