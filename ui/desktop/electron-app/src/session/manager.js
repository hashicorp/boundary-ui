const Session = require('./index.js');

class SessionManager {
  #sessions;

  constructor() {
    this.#sessions = [];
  }

  /**
   * Checks for active sessions
   * @returns {boolean}
   */
  get hasActiveSessions() {
    return Boolean(this.#sessions.find((session) => session.isActive));
  }

  /**
   * Start a session and track it.
   * Returns session proxy details if successfully started.
   * @param {string} addr
   * @param {string} target_id
   * @param {string} token
   * @param {string} host_id
   */
  async start(addr, target_id, token, host_id) {
    const session = new Session(addr, target_id, token, host_id);
    this.#sessions.push(session);
    return session.start();
  }

  /**
   * Stop a session using identifier.
   * @param {string} session_id
   */
  async stopById(session_id) {
    const session = this.#sessions.find((session) => session.id === session_id);
    return session && session.stop();
  }

  stopAll() {
    this.#sessions.forEach((session) => session.stop());
  }
}

const sessionManager = new SessionManager();
module.exports = sessionManager;
