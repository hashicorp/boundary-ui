/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

const sanitizer = require('../utils/sanitizer.js');
const {
  spawnAsyncJSONPromise,
  spawnSync,
} = require('../helpers/spawn-promise.js');
const log = require('electron-log/main');

class Session {
  #id;
  #addr;
  #token;
  #hostId;
  #process;
  #targetId;
  #proxyDetails;
  #sessionMaxSeconds;

  /**
   * Initialize a session to a controller address
   * using target details.
   * @param {string} addr
   * @param {string} targetId
   * @param {string} token
   * @param {string} hostId
   * @param {number} sessionMaxSeconds
   */
  constructor(addr, targetId, token, hostId, sessionMaxSeconds) {
    this.#addr = addr;
    this.#targetId = targetId;
    this.#token = token;
    this.#hostId = hostId;
    this.#sessionMaxSeconds = sessionMaxSeconds;
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
    return this.#process && !this.#process.killed;
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
  start() {
    const sanitizedToken = sanitizer.base62EscapeAndValidate(this.#token);
    return spawnAsyncJSONPromise(
      this.connectCommand,
      sanitizedToken,
      this.#sessionMaxSeconds,
    ).then((spawnedSession) => {
      this.#process = spawnedSession.childProcess;
      this.#proxyDetails = spawnedSession.response;
      this.#process = spawnedSession.childProcess; // this should get deleted lol
      this.#id = this.#proxyDetails.session_id;
      // shouldn't we define the event listeners here & set this.#process to undefined
      // in case that the process unexpectedly closes or exits or even on error?
      return this.#proxyDetails;
    });
  }

  /**
   * Stop proxy process used by session.
   */
  stop() {
    return new Promise((resolve, reject) => {
      if (this.isRunning) {
        this.#process.on('close', () => resolve());
        //this.#process.on('exit', () => resolve());
        this.#process.on('error', (e) => {
          if (e.code === 'ESRCH') {
            console.log(
              'Attempted to kill a non-existent process. It likely already terminated.',
            );
            log.info('Process error: attempted to kill non-existent process.');
          } else {
            console.log('PROCESS ERROR', e);
            log.info('Process error: ', e);
          }
          return reject(e);
        });

        // Cancel session before killing process
        const sanitizedToken = sanitizer.base62EscapeAndValidate(this.#token);
        const sanitizedAddr = sanitizer.urlValidate(this.#addr);
        console.log('BEFORE CANCEL SESSION CMD ', this.#id);
        log.info('Attempting to cancel session ', this.#id);
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

        console.log('After CANCEL SESSION CMD (before kill)', this.#id);
        log.info(
          'Canceled session ',
          this.#id,
          ' successfully. Now initiating process kill.',
        );
        this.#process.kill();
        log.info('Process killed successfully. ', this.#id);
      } else {
        // Do nothing when process isn't running
        console.log('SESSION IS NOT RUNNING ', this.#id);
        log.info('Session is not running.', this.#id);
        resolve();
      }
    });
  }
}

module.exports = Session;
