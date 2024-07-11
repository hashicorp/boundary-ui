/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { resourceFilter } from 'core/decorators/resource-filter';
import {
  TYPE_AUTH_METHOD_OIDC,
  TYPE_AUTH_METHOD_LDAP,
} from 'api/models/auth-method';

export default class ScopesScopeRolesRoleAddPrincipalsRoute extends Route {
  // =services

  @service router;
  @service store;

  // =attributes

  @resourceFilter({
    allowed: (route) => route.store.peekAll('scope'),
    serialize: ({ id }) => id,
    findBySerialized: ({ id }, value) => id === value,
  })
  scope;

  // =methods

  /**
   * Preload all scopes recursively, but allow this to fail.
   */
  async beforeModel() {
    await this.store
      .query('scope', { scope_id: 'global', recursive: true })
      .catch(() => {});
  }

  /**
   * Returns the current role, all users, and all groups
   * @return {{role: RoleModel, users: [UserModel], groups: [GroupModel]}}
   */
  async model() {
    const role = this.modelFor('scopes.scope.roles.role');
    const scopes = this.store.peekAll('scope');
    const scopeIDs = this.scope?.map((scope) => scope.id);
    const query = { filters: { scope_id: [] } };
    scopeIDs?.forEach((scopeID) => {
      query.filters.scope_id.push({ equals: scopeID });
    });
    const users = await this.store.query('user', {
      scope_id: 'global',
      recursive: true,
      query,
    });
    const groups = await this.store.query('group', {
      scope_id: 'global',
      recursive: true,
      query,
    });
    //query authmethods from all the scopes
    query.filters.type = [
      { equals: TYPE_AUTH_METHOD_OIDC },
      { equals: TYPE_AUTH_METHOD_LDAP },
    ];
    const authMethods = await this.store.query('auth-method', {
      scope_id: 'global',
      recursive: true,
      query,
    });
    //query all the managed groups for each auth method id
    const managedGroups = await Promise.all(
      authMethods.map(({ id: auth_method_id }) =>
        this.store.query('managed-group', { auth_method_id }),
      ),
    );

    return {
      role,
      scopes,
      users,
      groups,
      managedGroups: managedGroups.flat(),
    };
  }

  /**
   * Sets the specified resource filter field to the specified value.
   * @param {string} field
   * @param value
   */
  @action
  filterBy(field, value) {
    this[field] = value;
  }

  /**
   * Clears and filter selections.
   */
  @action
  clearAllFilters() {
    this.scope = [];
  }
}
