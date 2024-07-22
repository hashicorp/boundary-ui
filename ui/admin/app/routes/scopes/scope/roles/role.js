/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

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
   * Event to determine whether the loading template should be shown.
   * Only show the loading template when transitioning into the specified route.
   * @param transition
   * @returns {boolean}
   */
  @action
  loading(transition) {
    const to = transition.to?.name;
    return to === 'scopes.scope.roles.role.index';
  }
}
