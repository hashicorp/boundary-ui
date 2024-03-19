/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ScopesScopeCredentialStoresRoute extends Route {
  // =services

  @service store;
  @service can;

  // =methods

  /**
   * Load all credential stores under current scope
   * @returns {Promise[CredentialStoreModel]}
   */
  async model() {
    const scope = this.modelFor('scopes.scope');
    const { id: scope_id } = scope;
    if (
      this.can.can('list model', scope, {
        collection: 'credential-stores',
      })
    ) {
      return this.store.query('credential-store', { scope_id });
    }
  }
}
