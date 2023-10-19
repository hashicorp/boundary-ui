/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { paramValueFinder } from 'admin/utils/route-info';

export default class ScopesScopeCredentialStoresCredentialStoreRoute extends Route {
  // =services

  @service store;
  @service can;
  @service router;

  /**
   * Load a specific credential store in current scope
   * @return {CredentialStoreModel}
   */
  async model({ credential_store_id }) {
    return this.store.findRecord('credential-store', credential_store_id);
  }

  redirect(credentialStore, transition) {
    const scope = this.modelFor('scopes.scope');
    if (
      this.can.cannot('read credential-store', credentialStore, {
        resource_id: credentialStore.scopeID,
        collection_id: scope.id,
      })
    ) {
      let paramValues = paramValueFinder(
        'credential-store',
        transition.to.parent
      );
      this.router.transitionTo(
        transition.to.name,
        credentialStore.scopeID,
        credentialStore.id,
        ...paramValues
      );
    }
  }
}
