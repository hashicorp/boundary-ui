/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { paramValueFinder } from 'admin/utils/param-value-finder';

export default class ScopesScopeAuthMethodsAuthMethodRoute extends Route {
  // =services

  @service store;
  @service abilities;
  @service router;

  // =methods

  /**
   * Load an auth method by ID.
   * @param {object} params
   * @param {string} params.auth_method_id
   * @return {Promise{AuthMethodModel}}
   */
  async model({ auth_method_id }) {
    return this.store.findRecord('auth-method', auth_method_id, {
      reload: true,
    });
  }

  /**
   * Redirects to route with correct scope id if incorrect.
   * @param {AuthMethodModel} authMethod
   * @param {object} transition
   */
  redirect(authMethod, transition) {
    const scope = this.modelFor('scopes.scope');
    if (authMethod.scopeID !== scope.id) {
      let paramValues = paramValueFinder('auth-method', transition.to.parent);
      this.router.replaceWith(
        transition.to.name,
        authMethod.scopeID,
        authMethod.id,
        ...paramValues,
      );
    }
  }
}
