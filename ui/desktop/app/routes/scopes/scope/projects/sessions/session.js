/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ScopesScopeProjectsSessionsSessionRoute extends Route {
  // =services

  @service store;
  @service clientAgentSessions;

  // =methods

  /**
   * Load a session
   * @param {object} params
   * @param {string} params.session_id
   * @return {SessionModel}
   */
  async model({ session_id }) {
    const session = await this.store.findRecord('session', session_id);

    // If we don't have any credentials, we'll try to fetch them from the client agent in case this session
    // was initiated through the client agent.
    if (!session.credentials.length) {
      const clientAgentSessions =
        await this.clientAgentSessions.getClientAgentSession(session.id);
      if (clientAgentSessions) {
        clientAgentSessions.session_authorization.credentials.forEach((cred) =>
          session.addCredential(cred),
        );
      }
    }

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
