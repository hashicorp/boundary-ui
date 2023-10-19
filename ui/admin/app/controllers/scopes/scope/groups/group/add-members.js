/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Controller from '@ember/controller';

export default class ScopesScopeGroupsGroupAddMembersController extends Controller {
  // =services

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
}
