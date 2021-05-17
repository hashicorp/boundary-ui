const { spawnAsyncJSONPromise } = require('../helpers/spawn-promise.js');
const sanitizer = require('../utils/sanitizer.js');

class Session {
  #id;
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
    return !this.#process.killed;
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
      return this.#proxyDetails;
    });
  }

  /**
   * Stop proxy process used by session.
   */
  stop() {
    return new Promise((resolve, reject) => {
      if (this.isActive) {
        this.#process.on('close', () => resolve());
        this.#process.on('error', (e) => reject(e));
        this.#process.kill();
      } else {
        // Do nothing when process isn't active
        resolve();
      }
    });
  }

  /**
   * Generate cli command for session.
   * @returns {[]}
   */
  cliCommand() {
    const sanitized = {
      target_id: sanitizer.base62EscapeAndValidate(this.#targetId),
      token: sanitizer.base62EscapeAndValidate(this.#token),
      addr: sanitizer.urlValidate(this.#addr),
    };

    const command = [
      'connect',
      `-target-id=${sanitized.target_id}`,
      `-token=${sanitized.token}`,
      `-addr=${sanitized.addr}`,
      '-format=json',
    ];

    if (this.#hostId) {
      sanitized.host_id = sanitizer.base62EscapeAndValidate(this.#hostId);
      command.push(`-host-id=${sanitized.host_id}`);
    }
    return command;
  }
}

module.exports = Session;
