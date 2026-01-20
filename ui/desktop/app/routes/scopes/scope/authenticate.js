/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ScopesScopeAuthenticateRoute extends Route {
  // =services

  @service store;
  @service session;
  @service clusterUrl;
  @service router;
  @service resourceFilterStore;

  // =methods

  beforeModel() {
    if (this.session.isAuthenticated) {
      this.router.replaceWith('scopes.scope.index');
    }
  }

  /**
   * Returns all auth methods for the current scope, along with the current
   * scope and all scopes (for org navigation).
   * @return {Promise} `{scope, scopes, authMethods}`
   */
  async model() {
    const { id: scope_id } = this.modelFor('scopes.scope');

    // Preload all authenticatable auth methods into the store
    const authMethodsForAllScopes = await this.resourceFilterStore.queryBy(
      'auth-method',
      {
        authorized_actions: [{ contains: 'authenticate' }],
      },
      {
        scope_id: 'global',
        recursive: true,
      },
    );

    const scopeIDs = new Set(
      authMethodsForAllScopes.map((authMethod) => authMethod.scopeID),
    );

    // Fetch org scopes and filter out any that have no auth methods
    const scopes = this.modelFor('scopes').filter(({ id: scope_id }) =>
      scopeIDs.has(scope_id),
    );

    // Filter out auth methods that are not for the current scope
    const authMethods = authMethodsForAllScopes.filter(
      (authMethod) => authMethod.scopeID === scope_id,
    );

    return {
      scope: this.modelFor('scopes.scope'),
      scopes,
      authMethods,
    };
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
