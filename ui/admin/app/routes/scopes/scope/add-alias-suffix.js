/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ScopesScopeAddAliasSuffixRoute extends Route {
  // =services

  @service store;

  // =methods

  /**
   * Returns the current scope.
   * @return {ScopeModel}
   */
  model() {
    return this.modelFor('scopes.scope');
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
