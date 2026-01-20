/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class OnboardingSuccessRoute extends Route {
  // =services

  @service('browser/window') window;

  // =methods

  model() {
    const model = this.modelFor('onboarding');
    return {
      ...model,
      clusterUrl: this.window.origin,
    };
  }
}
