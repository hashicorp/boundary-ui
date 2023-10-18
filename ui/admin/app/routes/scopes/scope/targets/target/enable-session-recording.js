/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class ScopesScopeTargetsTargetEnableSessionRecordingRoute extends Route {
  // =services
  @service store;
  @service router;

  // =methods

  /**
   * Returns the current target
   * @return {TargetModel}
   */

  model() {
    return this.modelFor('scopes.scope.targets.target');
  }

  // =actions
  /**
   * Reset the selected storage bucket and redirect to target
   * @param {TargetModel} target
   */
  @action
  cancel(target) {
    const { id } = target;
    target.rollbackAttributes();
    this.router.replaceWith('scopes.scope.targets.target', id);
  }
}
