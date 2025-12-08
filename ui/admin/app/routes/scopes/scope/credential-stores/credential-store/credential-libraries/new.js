/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';
import {
  TYPE_CREDENTIAL_LIBRARY_VAULT_GENERIC,
  TYPE_CREDENTIAL_LIBRARY_VAULT_SSH_CERTIFICATE,
} from 'api/models/credential-library';

export default class ScopesScopeCredentialStoresCredentialStoreCredentialLibrariesNewRoute extends Route {
  // =services

  @service store;
  @service router;
  @service features;
  @service abilities;

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
      this.abilities.cannot('create model', credentialStore, {
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

    let name, description;
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

    return this.store.createRecord('credential-library', {
      type: resolvedType,
      credential_store_id,
      name,
      description,
    });
  }
}
