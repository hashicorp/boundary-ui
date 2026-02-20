/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

const Session = require('./session.js');

class SessionManager {
  #sessions = new Map();

  /**
   * Checks for running sessions
   * @returns {boolean}
   */
  get hasRunningSessions() {
    return Boolean(
      this.#sessions.values().find((session) => session.isRunning),
    );
  }

  /**
   * Start a session and track it.
   * Returns session proxy details if successfully started.
   * @param {string} addr
   * @param {string} target_id
   * @param {string} token
   * @param {string} host_id
   * @param {number} session_max_seconds
   */
  start(addr, target_id, token, host_id, session_max_seconds) {
    const session = new Session(
      addr,
      target_id,
      token,
      host_id,
      session_max_seconds,
      (sessionId) => this.#sessions.delete(sessionId),
    );
    return session.start().then((proxyDetails) => {
      // Store session by id for tracking and stopping later
      // Needs to be done after session.start() resolves
      // since session id is generated in start()
      this.#sessions.set(session.id, session);
      return proxyDetails;
    });
  }

  /**
   * Stop a session using identifier
   * and remove it from tracking.
   * @param {string} session_id
   */
  stopById(session_id) {
    const session = this.#sessions.get(session_id);
    return session?.stop();
  }

  /**
   * Get session by identifier.
   * @param {string} sessionId
   * @returns {Session} The session object
   */
  getSessionById(sessionId) {
    return this.#sessions.get(sessionId);
  }

  /**
   * Stop all active and pending target sessions
   * Returning Promise.all() ensures all sessions in the list have been
   * stopped before calling the next fn
   * along with clearing the sessions list.
   */
  stopAll() {
    return Promise.all(
      this.#sessions.values().map((session) => session.stop()),
    );
  }
}

module.exports = SessionManager;
