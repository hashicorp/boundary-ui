/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ScopesScopeRolesRoleIndexRoute extends Route {
  // =services

  @service store;

  /**
   * Load the role's scope and sub scopes into a hierarchical data structure.
   * @param {Model} model
   */
  async afterModel() {
    const currentScope = this.modelFor('scopes.scope');
    const subScopes = currentScope.isProject
      ? []
      : (await this.store.query('scope', { scope_id: currentScope.id })).map(
          (scope) => ({
            model: scope,
            subScopes: this.store.query('scope', { scope_id: scope.id }),
          })
        );
    const grantScopes = [
      {
        model: currentScope,
        subScopes,
      },
    ];
    this.grantScopes = grantScopes;
  }

  /**
   * Adds `grantScopes` to the context.
   * @param {Controller} controller
   */
  setupController(controller) {
    super.setupController(...arguments);
    controller.set('grantScopes', this.grantScopes);
  }
}
