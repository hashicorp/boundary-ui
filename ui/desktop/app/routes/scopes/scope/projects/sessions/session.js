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
    const session = await this.store.findRecord('session', session_id);

    /**
     * If the session has a host_id and the user has grants,
     * we retrieve the host and aggregate it to the session model.
     */
    if (session.host_id) {
      try {
        const host = await this.store.findRecord('host', session.host_id);
        session.addHost(host);
      } catch (error) {
        // no operation
      }
    }

    return session;
  }
}
