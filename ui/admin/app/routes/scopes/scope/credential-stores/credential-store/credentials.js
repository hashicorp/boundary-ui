/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ScopesScopeCredentialStoresCredentialStoreCredentialsRoute extends Route {
  // =services

  @service store;
  @service can;

  // =methods

  /**
   * Loads all credentials under the current credential store.
   * @return {Promise{[CredentialModel]}}
   */
  model() {
    const credentialStore = this.modelFor(
      'scopes.scope.credential-stores.credential-store',
    );
    const { id: credential_store_id } = credentialStore;
    if (
      this.can.can('list model', credentialStore, {
        collection: 'credentials',
      })
    ) {
      return this.store.query('credential', { credential_store_id });
    }
  }
}
