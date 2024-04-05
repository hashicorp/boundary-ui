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
    let subScopes = [];
    //await the store query to fix ember's proxy promise deprecation warning
    if (!currentScope.isProject) {
      const scopes = await this.store.query('scope', {
        scope_id: 'global',
        recursive: true,
        query: { filters: { scope_id: [{ equals: currentScope.id }] } },
      });
      subScopes = await Promise.all(
        scopes.map(async (scope) => ({
          model: scope,
          subScopes: !scope.isProject
            ? await this.store.query('scope', {
                scope_id: 'global',
                recursive: true,
                query: { filters: { scope_id: [{ equals: scope.id }] } },
              })
            : [],
        })),
      );
    }

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
