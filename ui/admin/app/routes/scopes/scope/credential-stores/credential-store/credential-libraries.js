/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ScopesScopeCredentialStoresCredentialStoreCredentialLibrariesRoute extends Route {
  // =services

  @service store;
  @service can;

  // =methods

  /**
   * Loads all credential libraries under the current credential store.
   * @return {Promise{[CredentialLibraryModel]}}
   */
  model() {
    const credentialStore = this.modelFor(
      'scopes.scope.credential-stores.credential-store',
    );
    const { id: credential_store_id } = credentialStore;
    if (
      this.can.can('list model', credentialStore, {
        collection: 'credential-libraries',
      })
    ) {
      return this.store.query('credential-library', { credential_store_id });
    }
  }
}
