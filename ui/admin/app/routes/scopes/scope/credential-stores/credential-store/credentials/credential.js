/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ScopesScopeCredentialStoresCredentialStoreCredentialsCredentialRoute extends Route {
  // =services

  @service store;
  @service can;
  @service router;

  // =methods

  /**
   * Load a credential using current credential store and its parent scope.
   * @param {object} params
   * @param {string} params.credential_id
   * @return {Promise{CredentialModel}}
   */
  async model({ credential_id }) {
    return this.store.findRecord('credential', credential_id, {
      reload: true,
    });
  }

  /**
   * Redirects to route with correct credential-store id if incorrect.
   * @param {CredentialModel} credential
   */
  redirect(credential) {
    const credentialStore = this.modelFor(
      'scopes.scope.credential-stores.credential-store',
    );
    const { credential_store_id } = credential;
    if (credential_store_id !== credentialStore.id) {
      this.router.replaceWith(
        'scopes.scope.credential-stores.credential-store.credentials.credential',
        credential_store_id,
        credential.id,
      );
    }
  }
}
