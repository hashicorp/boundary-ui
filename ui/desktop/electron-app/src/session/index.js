const { spawnAsyncJSONPromise } = require('../spawn-promise.js');

// FIXME create structure 'util' folder for spawn-promise

/**
 * Super paranoid shell quote/escape and validation.  Input must be base62.
 * @param {string} str
 */
const escapeAndValidateBase62 = (str) => {
  const candidate = str.toString();
  if (candidate.match(/^[A-Za-z0-9_]*$/)) return candidate;
  throw new Error(`
    Could not invoke command:
    input contained unsafe characters.
  `);
};

class Session {
  #id;
  #pid;
  #addr;
  #token;
  #hostId;
  #process;
  #targetId;
  #proxyDetails;

  /**
   * Initialize a session to a controller address
   * using target details.
   * @param {string} addr
   * @param {string} targetId
   * @param {string} token
   * @param {string} hostId
   */
  constructor(addr, targetId, token, hostId) {
    this.#addr = addr;
    this.#targetId = targetId;
    this.#token = token;
    this.#hostId = hostId;
  }

  /**
   * Session id
   * @return {string}
   */
  get id() {
    return this.#id;
  }

  /**
   * @return {boolean}
   */
  get isActive() {
    return this.#process.connected;
  }

  /**
   * Returns session proxy details.
   * Only available after successful start of a session.
   * @return {object}
   */
  get proxyDetails() {
    return this.#proxyDetails;
  }

  /**
   * Using cli, initialize a session to a target.
   * Tracks local proxy details if successful.
   */
  start() {
    const command = this.cliCommand();
    return spawnAsyncJSONPromise(command).then((spawnedSession) => {
      this.#process = spawnedSession.childProcess;
      this.#proxyDetails = spawnedSession.response;
      this.#process = spawnedSession.childProcess;
      this.#id = this.#proxyDetails.session_id;
    });
  }

  /**
   * Stop proxy used by session.
   */
  stop() {
    return new Promise((resolve, reject) => {
      this.#process.on('close', () => resolve());
      this.#process.on('error', (e) => reject(e));
      this.#process.kill();
    });
  }

  /**
   * Generate cli command for session.
   * @returns {[]}
   */
  cliCommand() {
    const sanitized = {
      target_id: escapeAndValidateBase62(this.#targetId),
      token: escapeAndValidateBase62(this.#token),
    };

    const command = [
      'connect',
      `-target-id=${sanitized.target_id}`,
      `-token=${sanitized.token}`,
      `-addr=${this.#addr}`,
      '-format=json',
    ];

    if (this.#hostId) {
      sanitized.host_id = escapeAndValidateBase62(this.#hostId);
      command.push(`-host-id=${sanitized.host_id}`);
    }
    return command;
  }
}

module.exports = Session;
