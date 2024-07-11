/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { loading } from 'ember-loading';
import { notifySuccess, notifyError } from 'core/decorators/notify';

export default class ScopesScopeGroupsGroupAddMembersController extends Controller {
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
}
