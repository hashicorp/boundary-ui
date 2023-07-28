/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { notifySuccess, notifyError } from 'core/decorators/notify';
import { inject as service } from '@ember/service';
export default class ScopesScopeAuthMethodsAuthMethodRoute extends Route {
  // =services

  @service store;

  // =methods

  /**
   * Load an auth method by ID.
   * @param {object} params
   * @param {string} params.auth_method_id
   * @return {authMethodModel}
   */
  async model({ auth_method_id }) {
    return this.store.findRecord('auth-method', auth_method_id);
  }

  // =actions

  /**
   * Copies the contents of string array fields in order to force the instance
   * into a dirty state.  This ensures that `model.rollbackAttributes()` reverts
   * to the original expected array.
   *
   * The deep copy implemented here is required to ensure that both the
   * array itself and its members are all new.
   *
   * @param {authMethodModel} authMethod
   */
  @action
  edit(authMethod) {
    if (authMethod.claims_scopes) {
      authMethod.claims_scopes = structuredClone(authMethod.claims_scopes);
    }
    if (authMethod.signing_algorithms) {
      authMethod.signing_algorithms = structuredClone(
        authMethod.signing_algorithms
      );
    }
    if (authMethod.allowed_audiences) {
      authMethod.allowed_audiences = structuredClone(
        authMethod.allowed_audiences
      );
    }
    if (authMethod.idp_ca_certs) {
      authMethod.idp_ca_certs = structuredClone(authMethod.idp_ca_certs);
    }
    if (authMethod.account_claim_maps) {
      authMethod.account_claim_maps = structuredClone(
        authMethod.account_claim_maps
      );
    }
    if (authMethod.certificates) {
      authMethod.certificates = structuredClone(authMethod.certificates);
    }
    if (authMethod.account_attribute_maps) {
      authMethod.account_attribute_maps = structuredClone(
        authMethod.account_attribute_maps
      );
    }
  }

  /**
   * Update state of OIDC or LDAP auth method
   * @param {string} state
   */
  @action
  @notifyError(({ message }) => message)
  @notifySuccess('notifications.save-success')
  async changeState(state) {
    const model = this.modelFor('scopes.scope.auth-methods.auth-method');
    await model.changeState(state);
  }
}
