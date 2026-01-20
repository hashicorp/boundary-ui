/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ScopesScopeAuthMethodsAuthMethodManagedGroupsManagedGroupRoute extends Route {
  // =services

  @service store;
  @service router;

  // =methods

  /**
   * Load managed group by ID.
   * @param {object} params
   * @param {string} params.managed_group_id
   * @returns {Promise{ManagedGroupModel}}
   */
  async model({ managed_group_id }) {
    return this.store.findRecord('managed-group', managed_group_id, {
      reload: true,
    });
  }

  /**
   * Redirects to route with correct auth-method id if incorrect.
   * @param {ManagedGroupModel} managedGroup
   * @param {object} transition
   */
  redirect(managedGroup, transition) {
    const authMethod = this.modelFor('scopes.scope.auth-methods.auth-method');
    const { auth_method_id } = managedGroup;
    if (auth_method_id !== authMethod.id) {
      this.router.replaceWith(
        transition.to.name,
        auth_method_id,
        managedGroup.id,
      );
    }
  }
}
