/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller from '@ember/controller';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { loading } from 'ember-loading';
import { notifySuccess, notifyError } from 'core/decorators/notify';
import { tracked } from '@glimmer/tracking';
export default class ScopesScopeGroupsGroupAddMembersController extends Controller {
  // =services

  @service router;

  // =tracked
  @tracked selectedScopes = this.model.selectedScopes || [];

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
   * Adds members to the group and saves, replaces with the members index
   * route, and notifies the user of success or error.
   * @param {GroupModel} group
   * @param {[string]} userIDs
   */
  @action
  @loading
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('notifications.add-success')
  async addMembers(group, userIDs) {
    await group.addMembers(userIDs);
    await this.router.replaceWith('scopes.scope.groups.group.members');
  }

  /**
   * Redirect to group members as if nothing ever happened.
   */
  @action
  async cancel() {
    await this.router.replaceWith('scopes.scope.groups.group.members');
  }

  /**
   * Adds or removes a scope from the selectedScopes array.
   * Calls filterBy action located in the route.
   * @param {string} field
   * @param {[ScopeModel]} value
   */
  @action
  callFilterBy(field, value) {
    const isSelected = this.selectedScopes.some((item) => item.id === value.id);
    this.selectedScopes = isSelected
      ? this.selectedScopes.filter((item) => item.id !== value.id)
      : [...this.selectedScopes, value];
    this.send('filterBy', field, this.selectedScopes);
  }

  /**
   * Clears all filters and resets selectedScopes.
   * Calls clearAllFilters action located in the route.
   */
  @action
  callClearAllFilters() {
    this.selectedScopes = [];
    this.send('clearAllFilters');
  }
}
