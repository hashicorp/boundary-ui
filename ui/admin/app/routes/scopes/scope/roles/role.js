/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';
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
   * Only show the loading template during initial loads for specified
   * routes. Don't show it when a user is just searching or
   * filtering on the same page as it can be jarring.
   * @param transition
   * @returns {boolean}
   */
  @action
  loading(transition) {
    const to = transition.to?.name;
    const from = transition.from?.name;
    return (
      (to === 'scopes.scope.roles.role.index' ||
        to === 'scopes.scope.roles.role.manage-scopes.manage-custom-scopes' ||
        to === 'scopes.scope.roles.role.manage-scopes.manage-org-projects' ||
        to === 'scopes.scope.roles.role.scopes') &&
      from !== to
    );
  }
}
