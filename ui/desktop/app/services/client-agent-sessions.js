/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Service from '@ember/service';

export default class ClientAgentSessionsService extends Service {
  // =attributes
  #sessionsSet;

  // =methods

  /**
   * Returns a list of client agent sessions.
   * @returns {Promise<*>}
   */
  async getClientAgentSessions() {
    return window.boundary.getClientAgentSessions();
  }

  /**
   * Returns a client agent session by its session ID.
   * @param id
   * @returns {Promise<*>}
   */
  async getClientAgentSession(id) {
    const sessions = await this.getClientAgentSessions();

    return sessions?.find(
      (session) => session.session_authorization.session_id === id,
    );
  }

  /**
   * Returns a list of new sessions that have credentials.
   * @returns {Promise<Array<*>>}
   */
  async getNewSessionsWithCredentials() {
    const sessions = (await this.getClientAgentSessions()) ?? [];

    // Get sessions with credentials
    const sessionsWithCredentials = sessions.filter(
      (session) => session.session_authorization.credentials?.length > 0,
    );

    // If the set hasn't been initialized, this is our first run so we set the
    // initial sessions and return an empty array as these sessions are not new
    if (!this.#sessionsSet) {
      this.#sessionsSet = new Set(
        sessionsWithCredentials.map(
          (session) => session.session_authorization.session_id,
        ),
      );

      return [];
    }

    // Get the sessions that weren't present since the last check
    const newSessions = sessionsWithCredentials.filter(
      (session) =>
        !this.#sessionsSet.has(session.session_authorization.session_id),
    );

    // Set current sessions that have credentials
    this.#sessionsSet = new Set(
      sessionsWithCredentials.map(
        (session) => session.session_authorization.session_id,
      ),
    );

    return newSessions;
  }
}
