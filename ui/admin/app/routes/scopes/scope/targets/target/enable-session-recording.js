/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
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
