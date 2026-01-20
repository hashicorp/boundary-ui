/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ScopesScopeAuthenticateIndexRoute extends Route {
  // =services

  @service router;

  // =methods

  /**
   * This index route exists solely to redirect the user on to the
   * first auth method.
   * @param {object} model
   * @param {[AuthMethodModel]} model.authMethods
   */
  redirect({ authMethods }) {
    const firstAuthMethod = authMethods[0];
    if (firstAuthMethod) {
      this.router.replaceWith(
        'scopes.scope.authenticate.method',
        firstAuthMethod,
      );
    }
  }
}
