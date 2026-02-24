/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';

export default class ScopesScopeTargetsTargetEnableSessionRecordingRoute extends Route {
  // =methods

  /**
   * Returns the current target
   * @return {TargetModel}
   */

  model() {
    return this.modelFor('scopes.scope.targets.target');
  }
}
