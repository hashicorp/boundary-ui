/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ScopesScopeProjectsSessionsSessionRoute extends Route {
  // =services

  @service store;
  @service ipc;
  @service clientAgentSessions;
  @service flashMessages;
  @service intl;
  @service features;

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
    if (
      this.features.isEnabled('client-agent') &&
      !session.credentials.length &&
      (await this.ipc.invoke('isClientAgentRunning'))
    ) {
      try {
        const clientAgentSession =
          await this.clientAgentSessions.getClientAgentSession(session.id);
        clientAgentSession?.session_authorization?.credentials?.forEach(
          (cred) => session.addCredential(cred),
        );
      } catch (e) {
        __electronLog?.error(
          'Failed to fetch credentials from client agent',
          e.message,
        );

        this.flashMessages.danger(
          this.intl.t('errors.client-agent-failed.sessions'),
          {
            notificationType: 'error',
            sticky: true,
            dismiss: (flash) => flash.destroyMessage(),
          },
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
