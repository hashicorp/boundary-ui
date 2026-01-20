/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { TYPE_TARGET_RDP } from 'api/models/target';
const { __electronLog } = globalThis;

export default class ScopesScopeProjectsSessionsSessionRoute extends Route {
  // =services

  @service store;
  @service ipc;
  @service clientAgentSessions;
  @service flashMessages;
  @service intl;
  @service storage;

  // =methods

  /**
   * Load a session
   * @param {object} params
   * @param {string} params.session_id
   * @return {SessionModel}
   */
  async model({ session_id }) {
    const session = await this.store.findRecord('session', session_id);
    // If it's an RDP session, we show a warning message if the user hasn't dismissed it before.
    // This is to inform users about the potential security risks associated with RDP sessions.
    // We store a flag in localStorage to track whether the user has dismissed this warning.
    if (
      session.target?.type === TYPE_TARGET_RDP &&
      !this.storage.getItem('doNotShowRdpWarningAgain')
    ) {
      this.flashMessages.warning(
        this.intl.t('errors.rdp-warning.description'),
        {
          color: 'neutral',
          title: this.intl.t('errors.rdp-warning.title'),
          sticky: true,
          dismiss: (flash) => flash.destroyMessage(),
          button: {
            label: this.intl.t('errors.rdp-warning.do-not-show-again'),
            action: (flash) => {
              this.storage.setItem('doNotShowRdpWarningAgain', 'true');
              flash.destroyMessage();
            },
          },
        },
      );
    }

    // If we don't have any credentials, we'll try to fetch them from the client agent in case this session
    // was initiated through the client agent.
    if (
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
            color: 'critical',
            title: this.intl.t('states.error'),
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
