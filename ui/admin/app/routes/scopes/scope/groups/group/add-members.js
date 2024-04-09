/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { loading } from 'ember-loading';
import { notifySuccess, notifyError } from 'core/decorators/notify';
import { resourceFilter } from 'core/decorators/resource-filter';

export default class ScopesScopeGroupsGroupAddMembersRoute extends Route {
  // =services

  @service store;
  @service router;

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
   * Loads all users and returns them with the group.
   * @return {Promise<{group: GroupModel, users: [UserModel], scopes: [ScopeModel] }> }
   */
  async model() {
    const group = this.modelFor('scopes.scope.groups.group');
    // filter out projects, since the user resource exists only on org and above
    const scopes = this.store
      .peekAll('scope')
      .filter((scope) => !scope.isProject);
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
    return { group, users, scopes };
  }

  // =actions

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
