/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

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
