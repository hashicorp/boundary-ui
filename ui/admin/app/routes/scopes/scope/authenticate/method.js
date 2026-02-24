/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ScopesScopeAuthenticateMethodRoute extends Route {
  // =services

  @service store;

  // =methods

  /**
   * Returns an auth method by id.
   * @param {object} params
   * @return {Promise{AuthMethodModel}}
   */
  model({ auth_method_id: id }) {
    const adapterOptions = { scopeID: this.modelFor('scopes.scope').id };
    return this.store.peekRecord('auth-method', id, adapterOptions);
  }
}
