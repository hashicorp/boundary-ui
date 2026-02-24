/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { get } from '@ember/object';

export default class ScopesIndexRoute extends Route {
  // =services

  @service session;
  @service router;

  // =methods

  /**
   * If authenticated, redirects to the scope route of the authenticated scope.
   * If unauthenticated, redirects to the first scope that was loaded (if any).
   * @param {[ScopeModel]} model
   * @param {?ScopeModel} model[0]
   */
  redirect() {
    const authenticatedScopeID = get(
      this.session,
      'data.authenticated.scope.id',
    );
    if (authenticatedScopeID) {
      this.router.transitionTo('scopes.scope', authenticatedScopeID);
    } else {
      this.router.transitionTo('scopes.scope', 'global');
    }
  }
}
