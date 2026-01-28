/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller from '@ember/controller';
import { service } from '@ember/service';
import { action } from '@ember/object';

export default class OnboardingSuccessController extends Controller {
  // =services

  @service router;

  // =actions

  /**
   * Redirect user to target created during onboarding.
   * @param {object} model
   */
  @action
  showTargetList(model) {
    const {
      project: { id: scopeID },
      target: { id: targetID },
    } = model;
    this.router.transitionTo('scopes.scope.targets.target', scopeID, targetID);
  }
}
