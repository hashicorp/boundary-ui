/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

const sanitizer = require('../utils/sanitizer.js');
const { spawnSync, spawn } = require('../helpers/spawn-promise.js');
const log = require('electron-log/main');
const jsonify = require('../utils/jsonify.js');

class Session {
  #id;
  #addr;
  #token;
  #hostId;
  #process;
  #targetId;
  #proxyDetails;
  #sessionMaxSeconds;
  #onClose;

  /**
   * Initialize a session to a controller address
   * using target details.
   * @param {string} addr
   * @param {string} targetId
   * @param {string} token
   * @param {string} hostId
   * @param {number} sessionMaxSeconds
   * @param {function} onClose
   */
  constructor(addr, targetId, token, hostId, sessionMaxSeconds, onClose) {
    this.#addr = addr;
    this.#targetId = targetId;
    this.#token = token;
    this.#hostId = hostId;
    this.#sessionMaxSeconds = sessionMaxSeconds;
    this.#onClose = onClose;
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
  get isRunning() {
    return (
      this.#process &&
      this.#process.exitCode === null &&
      this.#process.signalCode === null
    );
  }

  /**
   * Get proxy details for the session
   * @return {Object}
   */
  get proxyDetails() {
    return this.#proxyDetails;
  }

  /**
   * Generate cli command for session.
   * @returns {string[]}
   */
  get connectCommand() {
    const sanitized = {
      target_id: sanitizer.base62EscapeAndValidate(this.#targetId),
      addr: sanitizer.urlValidate(this.#addr),
    };

    const command = [
      'connect',
      `-target-id=${sanitized.target_id}`,
      `-token=env://BOUNDARY_TOKEN`,
      `-addr=${sanitized.addr}`,
      '-format=json',
    ];

    if (this.#hostId) {
      sanitized.host_id = sanitizer.base62EscapeAndValidate(this.#hostId);
      command.push(`-host-id=${sanitized.host_id}`);
    }
    return command;
  }

  /**
   * Using cli, initialize a session to a target.
   * Tracks local proxy details if successful.
   */
  async start() {
    const sanitizedToken = sanitizer.base62EscapeAndValidate(this.#token);
    const options = {
      env: {
        ...process.env,
        BOUNDARY_TOKEN: sanitizedToken,
      },
      timeout: this.#sessionMaxSeconds
        ? this.#sessionMaxSeconds * 1000
        : undefined,
    };
    const { childProcess, stdout, stderr } = await spawn(
      this.connectCommand,
      options,
    );

    childProcess.on('close', () => {
      this.#onClose(this.#id);
    });

    if (stderr) {
      const errorResponse = jsonify(stderr);
      const error = errorResponse.api_error || errorResponse.error;
      throw new Error(
        error?.message ?? 'Unknown error occurred while starting session',
      );
    }

    const response = jsonify(stdout);
    this.#process = childProcess;
    this.#proxyDetails = response;
    this.#id = response.session_id;

    return response;
  }

  /**
   * Stop proxy process used by session.
   */
  stop() {
    return new Promise((resolve, reject) => {
      if (this.isRunning) {
        this.#process.on('close', () => resolve());
        this.#process.on('error', (e) => {
          log.error('Process error in session stop method: ', e);
          return reject(e);
        });

        // Cancel session before killing process
        const sanitizedToken = sanitizer.base62EscapeAndValidate(this.#token);
        const sanitizedAddr = sanitizer.urlValidate(this.#addr);
        const cancelSessionCommand = [
          'sessions',
          'cancel',
          `-id=${this.id}`,
          `-addr=${sanitizedAddr}`,
          '-token=env://BOUNDARY_TOKEN',
        ];
        spawnSync(cancelSessionCommand, {
          BOUNDARY_TOKEN: sanitizedToken,
        });

        this.#process.kill();
      } else {
        // Do nothing when process isn't running
        resolve();
      }
    });
  }
}

module.exports = Session;
