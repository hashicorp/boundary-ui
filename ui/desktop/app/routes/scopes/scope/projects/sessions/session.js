/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ScopesScopeProjectsSessionsSessionRoute extends Route {
  // =services

  @service store;

  // =methods
  /**
   * Controllers are singletons and all state maintained by
   * the controller will persist even if the user transitions
   * away from the route. This will reset "isRawApiVisible"
   * back to false when a user leaves this route.
   * @param {*} controller
   * @param {*} isExiting
   * @param {*} transition
   */
  resetController(controller, isExiting, transition) {
    if (isExiting && transition.targetName !== 'error') {
      controller.set('isRawApiVisible', false);
    }
  }

  /**
   * Load a session
   * @param {object} params
   * @param {string} params.session_id
   * @return {SessionModel}
   */
  model({ session_id }) {
    return this.store.findRecord('session', session_id, {
      reload: true,
    });
  }
}
