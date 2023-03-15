/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { hash } from 'rsvp';

export default class ScopesScopeAuthenticateRoute extends Route {
  // =services

  @service store;
  @service session;
  @service clusterUrl;
  @service router;

  // =methods

  beforeModel() {
    if (this.session.isAuthenticated)
      this.router.replaceWith('scopes.scope.index');
  }

  /**
   * Returns all auth methods for the current scope, along with the current
   * scope and all scopes (for org navigation).
   * @return {Promise} `{scope, scopes, authMethods}`
   */
  model() {
    const { id: scope_id } = this.modelFor('scopes.scope');
    return hash({
      scope: this.modelFor('scopes.scope'),
      scopes: this.modelFor('scopes').filter((scope) => scope.isOrg),
      authMethods: this.store.query('auth-method', { scope_id }),
    });
  }

  redirect() {
    if (!this.clusterUrl.rendererClusterUrl) this.router.replaceWith('index');
  }

  /**
   * Adds the existing clusterUrl, if any, to the controller scope.
   * @param {Controller} controller
   */
  setupController(controller) {
    super.setupController(...arguments);
    const clusterUrl = this.clusterUrl.rendererClusterUrl;
    controller.setProperties({ clusterUrl });
  }
}
