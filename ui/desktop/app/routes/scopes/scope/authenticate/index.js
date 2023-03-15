/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

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
    const firstAuthMethod = authMethods.firstObject;
    if (firstAuthMethod) {
      this.router.replaceWith(
        'scopes.scope.authenticate.method',
        firstAuthMethod
      );
    }
  }
}
