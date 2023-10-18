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
   * @return {SessionModel}
   */
  async model({ session_id }) {
    /**
     * Not using peekRecord because the user can arrive this route
     * directly without accessing the session previously.
     */
    const session = await this.store.findRecord('session', session_id, {
      reload: true,
    });

    // If the session has a host_id, we retrieve the host.
    if (session.host_id) {
      const host = await this.store.findRecord('host', session.host_id);
      session.addHost(host);
    }

    return session;
  }
}
