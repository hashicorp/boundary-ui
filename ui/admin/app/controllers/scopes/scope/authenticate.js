/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller from '@ember/controller';
import { service } from '@ember/service';

export default class ScopesScopeAuthenticateController extends Controller {
  @service router;

  // =attributes

  /**
   * Moves the global scope to index 0.
   * @type {Array}
   */

  get sortedScopes() {
    return [
      ...this.model.scopes.filter((scope) => scope.id === 'global'),
      ...this.model.scopes.filter((scope) => scope.id !== 'global'),
    ];
  }

  /**
   * Checks if the current route is the OIDC method authentication route.
   * @type {boolean}
   * @returns {boolean}
   */
  get isOIDCRoute() {
    return (
      this.router.currentRouteName === 'scopes.scope.authenticate.method.oidc'
    );
  }
}
