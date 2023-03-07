/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class OnboardingSuccessRoute extends Route {
  // =services
  @service router;
  @service session;
  @service('browser/window') window;

  // =methods
  model() {
    const model = this.modelFor('onboarding');
    return {
      ...model,
      clusterUrl: this.window.origin,
    };
  }

  @action
  showTargetList(scope) {
    const {
      project: { id: scopeID },
      target: { id: targetID },
    } = scope;
    this.router.transitionTo('scopes.scope.targets.target', scopeID, targetID);
  }
}
