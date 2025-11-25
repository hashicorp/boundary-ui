/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ScopesScopeCredentialStoresCredentialStoreCredentialsNewRoute extends Route {
  // =services

  @service store;
  @service router;
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
        collection: 'credentials',
      })
    ) {
      this.router.replaceWith(
        'scopes.scope.credential-stores.credential-store.credentials',
      );
    }
  }

  /**
   * Creates a new unsaved credential in current credential store.
   * Also rollback/destroy any new, unsaved instances from this route before
   * creating another, but reuse name/description if available.
   * @return {CredentialModel}
   */
  model({ type = 'username_password' }) {
    const { id: credential_store_id } = this.modelFor(
      'scopes.scope.credential-stores.credential-store',
    );
    let name, description;

    if (this.currentModel?.isNew) {
      ({ name, description } = this.currentModel);
      this.currentModel.rollbackAttributes();
    }

    /**
     * this sets the credential attribute json_object to a string that
     * replicates an empty json blob as CodeMirror expects a string
     */
    const typeSpecificAttrs = {};
    switch (type) {
      case 'json':
        typeSpecificAttrs.json_object = '{}';
    }

    return this.store.createRecord('credential', {
      type,
      credential_store_id,
      name,
      description,
      ...typeSpecificAttrs,
    });
  }
}
