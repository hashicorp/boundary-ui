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
   * Load a session
   * @param {object} params
   * @param {string} params.session_id
   * @return {{session: SessionModel, target: TargetModel}}
   */
  async model({ session_id }) {
    let target = null;
    const session = await this.store.findRecord('session', session_id, {
      reload: true,
    });

    try {
      if (session.target_id) {
        target = await this.store.findRecord('target', session.target_id);
      }
    } catch (e) {
      // no op
    }

    return {
      session,
      target,
    };
  }
}
