/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
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

  stopAll() {
    this.#sessions.forEach((session) => session.stop());
  }
}

module.exports = SessionManager;
