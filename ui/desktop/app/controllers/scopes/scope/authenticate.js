/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller from '@ember/controller';
import { service } from '@ember/service';

export default class ScopesScopeAuthenticateController extends Controller {
  // =services

  @service clusterUrl;

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
}
