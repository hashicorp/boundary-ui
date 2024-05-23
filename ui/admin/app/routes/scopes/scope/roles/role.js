/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
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
   * @return {Promise{RoleModel}}
   */
  async model({ role_id }) {
    const { id: scopeID } = this.modelFor('scopes.scope');
    return this.store.findRecord('role', role_id, {
      reload: true,
      adapterOptions: { scopeID },
    });
  }

  /**
   * Redirects to route with correct scope id if incorrect.
   * @param {RoleModel} role
   * @param {object} transition
   */
  redirect(role, transition) {
    const scope = this.modelFor('scopes.scope');
    if (role.scopeID !== scope.id) {
      this.router.replaceWith(transition.to.name, role.scopeID, role.id);
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
