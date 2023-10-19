/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class ScopesScopeRolesRoleRoute extends Route {
  // =services

  @service store;
  @service can;
  @service router;

  // =methods

  /**
   * Load a role in current scope.
   * @param {object} params
   * @param {string} params.role_id
   * @return {RoleModel}
   */
  async model({ role_id }) {
    const { id: scopeID } = this.modelFor('scopes.scope');
    return this.store.findRecord('role', role_id, {
      reload: true,
      adapterOptions: { scopeID },
    });
  }

  redirect(role, transition) {
    const scope = this.modelFor('scopes.scope');
    if (
      this.can.cannot('read role', role, {
        resource_id: role.scopeID,
        collection_id: scope.id,
      })
    ) {
      this.router.transitionTo(transition.to.name, role.scopeID, role.id);
    }
  }

  // =actions
  /**
   * Rollback changes on a role.
   * @param {RoleModel} role
   */
  @action
  cancel(role) {
    role.rollbackAttributes();
    this.refresh();
  }
}
