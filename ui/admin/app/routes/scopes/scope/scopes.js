/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

/**
 * The scopes route lists subscopes under the currently active scope.
 * For the global scope, the listed scopes are orgs.
 * For org scopes, the listed scopes are projects.
 */
export default class ScopesScopeScopesRoute extends Route {
  // =services

  @service session;
  @service router;

  // =methods

  /**
   * If arriving here unauthenticated, redirect to index for further processing.
   */
  beforeModel() {
    if (!this.session.isAuthenticated) this.router.transitionTo('index');
  }

  setupController(controller) {
    const currentScope = this.modelFor('scopes.scope');
    super.setupController(...arguments);
    controller.setProperties({ currentScope });
  }
}
