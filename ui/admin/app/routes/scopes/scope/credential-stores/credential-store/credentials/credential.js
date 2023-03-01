/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ScopesScopeCredentialStoresCredentialStoreCredentialsCredentialRoute extends Route {
  // =services

  @service store;

  // =methods

  /**
   * Load a credential using current credential store and its parent scope.
   * @param {object} params
   * @param {string} params.credential_id
   * @return {CredentialModel}
   */
  async model({ credential_id }) {
    return this.store.findRecord('credential', credential_id, {
      reload: true,
    });
  }
}
