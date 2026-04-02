/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

const Session = require('./session.js');
const log = require('electron-log/main');

const STOP_ALL_SESSION_TIMEOUT_MS = Number.parseInt(
  process.env.STOP_ALL_SESSION_TIMEOUT_MS ?? '7000',
  10,
);

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class SessionManager {
  #sessions = new Map();

  /**
   * Checks for running sessions
   * @returns {boolean}
   */
  get hasRunningSessions() {
    return Boolean(
      Array.from(this.#sessions.values()).find((session) => session.isRunning),
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
  async start(addr, target_id, token, host_id, session_max_seconds) {
    log.info(
      `[session-manager:start] creating session target=${target_id} host=${host_id ?? 'none'}`,
    );
    const session = new Session(
      addr,
      target_id,
      token,
      host_id,
      session_max_seconds,
      (sessionId) => {
        if (!sessionId) {
          log.warn(
            '[session-manager:onClose] close callback before session id was assigned',
          );
          return;
        }
        const didDelete = this.#sessions.delete(sessionId);
        log.info(
          `[session-manager:onClose] sessionId=${sessionId} removed=${didDelete}`,
        );
      },
    );
    const sessionDetails = await session.start();
    // Store session by id for tracking and stopping later
    // Needs to be done after session.start() resolves
    // since session id is generated in start()
    this.#sessions.set(session.id, session);
    log.info(
      `[session-manager:start] tracking sessionId=${session.id} trackedCount=${this.#sessions.size}`,
    );
    return sessionDetails;
  }

  /**
   * Stop a session using identifier
   * and remove it from tracking.
   * @param {string} session_id
   */
  stopById(session_id) {
    const session = this.#sessions.get(session_id);
    log.info(
      `[session-manager:stopById] requested sessionId=${session_id} found=${Boolean(session)}`,
    );
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
  async stopAll() {
    const sessions = Array.from(this.#sessions.values());
    log.info(
      `[session-manager:stopAll] requested trackedCount=${sessions.length}`,
    );

    const results = await Promise.allSettled(
      sessions.map((session) =>
        Promise.race([
          session.stop(),
          delay(STOP_ALL_SESSION_TIMEOUT_MS).then(() => {
            throw new Error(
              `Session stop timed out after ${STOP_ALL_SESSION_TIMEOUT_MS}ms for session ${session.id ?? 'unknown'}`,
            );
          }),
        ]),
      ),
    );

    const failures = [];
    for (const [index, result] of results.entries()) {
      const sessionId = sessions[index]?.id ?? 'unknown';
      if (result.status === 'fulfilled') {
        log.info(`[session-manager:stopAll] stopped sessionId=${sessionId}`);
      } else {
        log.error(
          `[session-manager:stopAll] failed sessionId=${sessionId}: ${result.reason?.message ?? result.reason}`,
        );
        failures.push(
          `sessionId=${sessionId}: ${result.reason?.message ?? result.reason}`,
        );
      }
    }

    if (failures.length > 0) {
      throw new Error(
        `stopAll failed for ${failures.length} session(s): ${failures.join('; ')}`,
      );
    }

    log.info('[session-manager:stopAll] completed');
  }
}

module.exports = SessionManager;
