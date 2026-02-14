/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';
import {
  TYPE_AUTH_METHOD_OIDC,
  TYPE_AUTH_METHOD_LDAP,
} from 'api/models/auth-method';

export default class ScopesScopeAuthMethodsNewRoute extends Route {
  // =services

  @service store;
  @service can;
  @service router;

  // =attributes

  queryParams = {
    type: {
      refreshModel: true,
    },
  };

  // =methods

  /**
   * Redirect to parent route when scope does not have create authorized action.
   */
  beforeModel() {
    const scopeModel = this.modelFor('scopes.scope');
    if (
      this.can.cannot('create model', scopeModel, {
        collection: 'auth-methods',
      })
    ) {
      this.router.replaceWith('scopes.scope.auth-methods');
    }
  }

  /**
   * Create a new unsaved auth-method.
   * @return {AuthMethodModel}
   */
  model(params) {
    const scopeModel = this.modelFor('scopes.scope');
    const record = this.store.createRecord('auth-method', {
      type: params.type,
    });
    record.scopeModel = scopeModel;

    // If the auth-method is of type OIDC, initialize the keyValue fields with an empty object.
    if (params.type === TYPE_AUTH_METHOD_OIDC) {
      record.account_claim_maps = [{ key: '', value: '' }];
      record.claims_scopes = [{ value: '' }];
      record.allowed_audiences = [{ value: '' }];
      record.signing_algorithms = [{ value: '' }];
      record.idp_ca_certs = [{ value: '' }];
    }
    // If the auth-method is of type LDAP, initialize the certificates field with an empty object.
    if (params.type === TYPE_AUTH_METHOD_LDAP) {
      record.certificates = [{ value: '' }];
      record.account_attribute_maps = [{ key: '', value: '' }];
    }

    return record;
  }
}
