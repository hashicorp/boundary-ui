const Session = require('./index.js');

class SessionManager {
  #sessions;

  constructor() {
    this.#sessions = [];
  }

  /**
   * Start a session and track it.
   * Returns session proxy details if successfully started.
   * Only successfully started sessions will be tracked.
   * @param {string} addr
   * @param {string} target_id
   * @param {string} token
   * @param {string} host_id
   */
  async start(addr, target_id, token, host_id) {
    const session = new Session(addr, target_id, token, host_id);
    return session.start().then(() => {
      this.#sessions.push(session);
      return session.proxyDetails;
    });
  }

  /**
   * Stop a session and remove it from tracked sessions.
   * @param {string} session_id
   */
  async stopById(session_id) {
    const index = this.#sessions.findIndex(
      (session) => session.id === session_id
    );
    if (index === -1) return;
    const session = this.#sessions[index];
    return session.stop().then(() => {
      this.#sessions.splice(index, 1);
    });
  }

  stopAll() {
  }

  get sessions() {
    return this.#sessions;
  }
}

const sessionManager = new SessionManager();
module.exports = sessionManager;
