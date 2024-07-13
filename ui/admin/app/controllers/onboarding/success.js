/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class OnboardingSuccessController extends Controller {
  // =services

  @service router;

  // =actions

  /**
   * Redirect user to target created during onboarding.
   * @param {ScopeModel} scope
   */
  @action
  showTargetList(scope) {
    const {
      project: { id: scopeID },
      target: { id: targetID },
    } = scope;
    this.router.transitionTo('scopes.scope.targets.target', scopeID, targetID);
  }
}
