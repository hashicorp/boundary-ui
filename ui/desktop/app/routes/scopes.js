/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { A } from '@ember/array';
import { inject as service } from '@ember/service';
import { set, get } from '@ember/object';

export default class ScopesRoute extends Route {
  // =services

  @service store;
  @service ipc;

  // =methods

  async beforeModel() {
    let isClientDaemonSupported = true;
    const adapter = this.store.adapterFor('application');
    const scopeSchema = this.store.modelFor('scope');

    try {
      const scopesCheck = await adapter.query(this.store, scopeSchema, {
        page_size: 1,
        recursive: true,
      });
      if (!scopesCheck.list_token) {
        isClientDaemonSupported = false;
      }
    } catch (e) {
      // no op
    }
    set(this, 'isClientDaemonSupported', isClientDaemonSupported);
  }

  /**
   * Attempt to load all scopes from the API.  This is allowed
   * to fail, since in some cases the user may not have permission to read a
   * scope directly, but may have permission to read resources under it.
   * If scopes fails to load, we still proceed using an empty array.
   * @param {object} params
   * @param {string} params.scope_id
   * @return {Promise{[ScopeModel]}}
   */
  async model() {
    // NOTE:  In the absence of a `scope_id` query parameter, this endpoint is
    // expected to default to the global scope, thus returning org scopes.
    let scopes = A([]);
    const isClientDaemonSupported = get(this, 'isClientDaemonSupported');

    if (isClientDaemonSupported) {
      scopes = await this.store.query('scope', {}).catch(() => A([]));
    }

    return { scopes, isClientDaemonSupported };
  }
}
