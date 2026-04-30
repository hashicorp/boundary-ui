/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ScopesScopeAddAliasSuffixRoute extends Route {
  // =services

  @service store;
  @service abilities;

  // =methods

  /**
   * Returns the current project scope.
   * @return {ScopeModel}
   */
  model() {
    return this.modelFor('scopes.scope');
  }

  /**
   * Refresh the alias suffix for project scopes.
   * @param {ScopeModel} scope
   */
  async afterModel(scope) {
    if (this.abilities.can('getAliasSuffix scope', scope)) {
      try {
        await this.store.findRecord('scope', scope.id, {
          adapterOptions: { method: 'get-alias-target-suffix' },
          reload: true,
        });
      } catch {
        // do nothing
      }
    }
  }

  /**
   * Adds the edit-flow flag to the context.
   * @param {Controller} controller
   * @param {ScopeModel} scope
   */
  setupController(controller, scope) {
    super.setupController(...arguments);
    controller.isEdit = scope.hasSuffix;
  }
}
