/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller from '@ember/controller';
import { service } from '@ember/service';
import { action } from '@ember/object';
export default class ScopesScopeAuthenticateController extends Controller {
  // =services

  @service clusterUrl;
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

  // =actions

  @action
  selectScope(scope, callback) {
    this.router.transitionTo('scopes.scope.authenticate', scope);
    callback();
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
