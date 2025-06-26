/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

const Session = require('./session.js');

class SessionManager {
  #sessions = [];

  /**
   * Checks for running sessions
   * @returns {boolean}
   */
  get hasRunningSessions() {
    return Boolean(this.#sessions.find((session) => session.isRunning));
  }

  /**
   * Start a session and track it.
   * Returns session proxy details if successfully started.
   * @param {string} addr
   * @param {string} target_id
   * @param {string} token
   * @param {string} host_id
   */
  start(addr, target_id, token, host_id) {
    const session = new Session(addr, target_id, token, host_id);
    this.#sessions.push(session);
    return session.start();
  }

  /**
   * Stop a session using identifier.
   * @param {string} session_id
   */
  stopById(session_id) {
    const session = this.#sessions.find((session) => session.id === session_id);
    return session?.stop?.();
  }

  /**
   * Stop all active and pending target sessions
   * Returning Promise.all() ensures all sessions in the list have been
   * stopped before calling the next fn
   */
  stopAll() {
    return Promise.all(this.#sessions.map((session) => session.stop()));
  }
}

module.exports = SessionManager;
