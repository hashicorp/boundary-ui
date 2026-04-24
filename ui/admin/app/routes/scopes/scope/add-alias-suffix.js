/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';

export default class ScopesScopeAddAliasSuffixRoute extends Route {
  // =methods

  /**
   * Returns the current project scope.
   * @return {ScopeModel}
   */
  model() {
    return this.modelFor('scopes.scope');
  }
}
