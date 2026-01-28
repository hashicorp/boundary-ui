/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ScopesScopeCredentialStoresCredentialStoreCredentialLibrariesCredentialLibraryRoute extends Route {
  // =services

  @service store;
  @service router;

  // =methods

  /**
   * Load a credential-library using current credential store and its parent scope.
   * @param {object} params
   * @param {string} params.credential_library_id
   * @return {Promise{CredentialLibraryModel}}
   */
  async model({ credential_library_id }) {
    return this.store.findRecord('credential-library', credential_library_id, {
      reload: true,
    });
  }

  /**
   * Redirects to route with correct credential-store id if incorrect.
   * @param {CredentialLibraryModel} credentialLibrary
   */
  redirect(credentialLibrary) {
    const credentialStore = this.modelFor(
      'scopes.scope.credential-stores.credential-store',
    );
    const { credential_store_id } = credentialLibrary;
    if (credential_store_id !== credentialStore.id) {
      this.router.replaceWith(
        'scopes.scope.credential-stores.credential-store.credential-libraries.credential-library',
        credential_store_id,
        credentialLibrary.id,
      );
    }
  }
}
