/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { paramValueFinder } from 'admin/utils/param-value-finder';

export default class ScopesScopeCredentialStoresCredentialStoreRoute extends Route {
  // =services

  @service store;
  @service can;
  @service router;

  /**
   * Load a specific credential store in current scope
   * @return {Promise{CredentialStoreModel}}
   */
  async model({ credential_store_id }) {
    return this.store.findRecord('credential-store', credential_store_id, {
      reload: true,
    });
  }

  /**
   * Redirects to route with correct scope id if incorrect.
   * @param {CredentialStoreModel} credentialStore
   * @param {object} transition
   */
  redirect(credentialStore, transition) {
    const scope = this.modelFor('scopes.scope');
    if (credentialStore.scopeID !== scope.id) {
      let paramValues = paramValueFinder(
        'credential-store',
        transition.to.parent,
      );
      this.router.replaceWith(
        transition.to.name,
        credentialStore.scopeID,
        credentialStore.id,
        ...paramValues,
      );
    }
  }
}
