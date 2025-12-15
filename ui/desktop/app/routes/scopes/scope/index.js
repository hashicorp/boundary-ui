/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ScopesScopeIndexRoute extends Route {
  // =services

  @service session;
  @service router;

  // =methods

  /**
   * Redirects to scopes/scope/authenticate for further processing.
   * If already authenticated, redirects to scopes/scope/scopes to display
   * list of sub scopes.
   */
  redirect() {
    if (!this.session.isAuthenticated) {
      this.router.replaceWith('scopes.scope.authenticate');
    } else {
      this.router.replaceWith('scopes.scope.projects.targets');
    }
  }
}
