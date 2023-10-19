/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class ScopesScopeCredentialStoresCredentialStoreCredentialLibrariesCredentialLibraryRoute extends Route {
  // =services

  @service store;
  @service can;
  @service router;

  // =methods

  /**
   * Load a credential-library using current credential store and its parent scope.
   * @param {object} params
   * @param {string} params.credential_library_id
   * @return {CredentialLibraryModel}
   */
  async model({ credential_library_id }) {
    return this.store.findRecord('credential-library', credential_library_id, {
      reload: true,
    });
  }

  redirect(credentialLibrary) {
    const credentialStore = this.modelFor(
      'scopes.scope.credential-stores.credential-store'
    );
    const { credential_store_id } = credentialLibrary;
    if (
      this.can.cannot('read credential-library', credentialLibrary, {
        resource_id: credential_store_id,
        collection_id: credentialStore.id,
      })
    ) {
      this.router.transitionTo(
        'scopes.scope.credential-stores.credential-store.credential-libraries.credential-library',
        credential_store_id,
        credentialLibrary.id
      );
    }
  }

  /**
   * Copies the contents of array fields in order to force the instance
   * into a dirty state.  This ensures that `model.rollbackAttributes()` reverts
   * to the original expected array.
   *
   * The deep copy implemented here is required to ensure that both the
   * array itself and its members are all new.
   *
   * @param {credentialLibraryModel} credentialLibrary
   */
  @action
  edit(credentialLibrary) {
    const { critical_options, extensions } = credentialLibrary;
    credentialLibrary.critical_options = structuredClone(critical_options);
    credentialLibrary.extensions = structuredClone(extensions);
  }
}
