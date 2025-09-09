/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';
import {
  TYPE_CREDENTIAL_LIBRARY_VAULT_GENERIC,
  TYPE_CREDENTIAL_LIBRARY_VAULT_LDAP,
  TYPE_CREDENTIAL_LIBRARY_VAULT_SSH_CERTIFICATE,
} from 'api/models/credential-library';
import { TYPE_CREDENTIAL_USERNAME_PASSWORD_DOMAIN } from 'api/models/credential';

export default class ScopesScopeCredentialStoresCredentialStoreCredentialLibrariesNewRoute extends Route {
  // =services

  @service store;
  @service router;
  @service features;
  @service can;

  // =attributes

  queryParams = {
    type: {
      refreshModel: true,
    },
  };

  // =methods

  /**
   * Redirect to parent route when credential-store does not have create authorized action.
   */
  beforeModel() {
    const credentialStore = this.modelFor(
      'scopes.scope.credential-stores.credential-store',
    );
    if (
      this.can.cannot('create model', credentialStore, {
        collection: 'credential-libraries',
      })
    ) {
      this.router.replaceWith(
        'scopes.scope.credential-stores.credential-store.credential-libraries',
      );
    }
  }

  /**
   * Creates a new unsaved credential library in current credential store.
   * @return {CredentialLibraryModel}
   */
  model({ type = TYPE_CREDENTIAL_LIBRARY_VAULT_GENERIC }) {
    const { id: credential_store_id } = this.modelFor(
      'scopes.scope.credential-stores.credential-store',
    );

    let name, description, credential_type;
    if (this.currentModel?.isNew) {
      ({ name, description } = this.currentModel);
      this.currentModel.rollbackAttributes();
    }

    // Set the type to generic vault if feature flag isn't enabled or type is not set in cases where
    // user sets the query parameter manually
    let resolvedType = type;
    if (
      !this.features.isEnabled('ssh-target') &&
      resolvedType === TYPE_CREDENTIAL_LIBRARY_VAULT_SSH_CERTIFICATE
    ) {
      resolvedType = TYPE_CREDENTIAL_LIBRARY_VAULT_GENERIC;
    }

    // Set the credential type to username_password_domain if the type is vault ldap
    if (resolvedType === TYPE_CREDENTIAL_LIBRARY_VAULT_LDAP) {
      credential_type = TYPE_CREDENTIAL_USERNAME_PASSWORD_DOMAIN;
    }

    return this.store.createRecord('credential-library', {
      type: resolvedType,
      credential_store_id,
      name,
      description,
      // credential_type is only set for vault ldap type
      credential_type,
    });
  }
}
