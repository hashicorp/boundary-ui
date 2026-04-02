/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

const sanitizer = require('../utils/sanitizer.js');
const { spawnSync, spawn } = require('../helpers/spawn-promise.js');
const log = require('electron-log/main');
const jsonify = require('../utils/jsonify.js');

const SESSION_STOP_TIMEOUT_MS = Number.parseInt(
  process.env.SESSION_STOP_TIMEOUT_MS ?? '5000',
  10,
);
const SESSION_FORCE_KILL_GRACE_MS = Number.parseInt(
  process.env.SESSION_FORCE_KILL_GRACE_MS ?? '1000',
  10,
);

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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
    log.info(
      `[session:start] starting target=${this.#targetId} host=${this.#hostId ?? 'none'} timeoutSeconds=${this.#sessionMaxSeconds ?? 'none'}`,
    );
    const sanitizedToken = sanitizer.base62EscapeAndValidate(this.#token);
    const options = {
      env: {
        ...process.env,
        BOUNDARY_TOKEN: sanitizedToken,
      },
      timeout: this.#sessionMaxSeconds
        ? this.#sessionMaxSeconds * 1000
        : undefined,
      onClose: () => {
        log.info(
          `[session:onClose] process closed for sessionId=${this.#id ?? 'unknown'}`,
        );
        this.#onClose?.(this.#id);
      },
    };
    const { childProcess, stdout, stderr } = await spawn(
      this.connectCommand,
      options,
    );

    log.info(
      `[session:start] spawn resolved pid=${childProcess?.pid ?? 'unknown'} hasStdout=${Boolean(stdout)} hasStderr=${Boolean(stderr)}`,
    );

    if (stderr) {
      const errorResponse = jsonify(stderr);
      const error = errorResponse.api_error || errorResponse.error;
      log.error(
        `[session:start] failed target=${this.#targetId} pid=${childProcess?.pid ?? 'unknown'} error=${error?.message ?? 'unknown'}`,
      );
      throw new Error(
        error?.message ?? 'Unknown error occurred while starting session',
      );
    }

    const response = jsonify(stdout);
    this.#process = childProcess;
    this.#proxyDetails = response;
    this.#id = response.session_id;

    log.info(
      `[session:start] started sessionId=${this.#id} pid=${this.#process?.pid ?? 'unknown'}`,
    );

    return response;
  }

  /**
   * Stop proxy process used by session.
   */
  async stop() {
    if (!this.isRunning) {
      log.info(
        `[session:stop] skipping stop; not running sessionId=${this.#id ?? 'unknown'}`,
      );
      return;
    }

    const processRef = this.#process;
    const sessionId = this.#id ?? 'unknown';
    const pid = processRef?.pid ?? 'unknown';
    log.info(`[session:stop] stopping sessionId=${sessionId} pid=${pid}`);

    let closeResolved = false;
    const closePromise = new Promise((resolve, reject) => {
      processRef.once('close', () => {
        closeResolved = true;
        log.info(
          `[session:stop] process closed sessionId=${sessionId} pid=${pid}`,
        );
        resolve();
      });
      processRef.once('error', (error) => {
        log.error(
          `[session:stop] process error sessionId=${sessionId} pid=${pid}:`,
          error,
        );
        reject(error);
      });
    });

    // Cancel session before killing process.
    const sanitizedToken = sanitizer.base62EscapeAndValidate(this.#token);
    const sanitizedAddr = sanitizer.urlValidate(this.#addr);
    const cancelSessionCommand = [
      'sessions',
      'cancel',
      `-id=${this.id}`,
      `-addr=${sanitizedAddr}`,
      '-token=env://BOUNDARY_TOKEN',
    ];

    const cancelResult = spawnSync(cancelSessionCommand, {
      BOUNDARY_TOKEN: sanitizedToken,
    });
    if (cancelResult.error || cancelResult.stderr) {
      log.warn(
        `[session:stop] cancel returned issues sessionId=${sessionId} pid=${pid} hasError=${Boolean(cancelResult.error)} hasStderr=${Boolean(cancelResult.stderr)}`,
      );
    }

    try {
      processRef.kill();
      log.info(`[session:stop] sent SIGTERM sessionId=${sessionId} pid=${pid}`);
    } catch (error) {
      log.warn(
        `[session:stop] failed to send SIGTERM sessionId=${sessionId} pid=${pid}:`,
        error,
      );
    }

    try {
      await Promise.race([
        closePromise,
        delay(SESSION_STOP_TIMEOUT_MS).then(() => {
          throw new Error(
            `Timed out waiting ${SESSION_STOP_TIMEOUT_MS}ms for session close`,
          );
        }),
      ]);
    } catch (error) {
      if (!closeResolved) {
        log.warn(
          `[session:stop] timeout reached, force-killing sessionId=${sessionId} pid=${pid}`,
        );
        try {
          processRef.kill('SIGKILL');
        } catch (killError) {
          log.warn(
            `[session:stop] failed to send SIGKILL sessionId=${sessionId} pid=${pid}:`,
            killError,
          );
        }
        await Promise.race([
          closePromise,
          delay(SESSION_FORCE_KILL_GRACE_MS).then(() => {
            throw new Error(
              `Force-kill grace period expired after ${SESSION_FORCE_KILL_GRACE_MS}ms for session ${sessionId}`,
            );
          }),
        ]);
      } else {
        throw error;
      }
    }
  }
}

module.exports = Session;
