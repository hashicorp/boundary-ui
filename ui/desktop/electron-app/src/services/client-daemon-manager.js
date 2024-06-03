/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

const { spawnSync, spawn } = require('../helpers/spawn-promise');
const jsonify = require('../utils/jsonify.js');
const { unixSocketRequest } = require('../helpers/request-promise');
const runtimeSettings = require('./runtime-settings');
const sanitizer = require('../utils/sanitizer.js');
const { isWindows } = require('../helpers/platform.js');
const treeKill = require('tree-kill');
const log = require('electron-log/main');

class ClientDaemonManager {
  #socketPath;
  #isClientDaemonAlreadyRunning = true;
  #clientDaemonProcess;

  get socketPath() {
    return this.#socketPath;
  }

  /**
   * Checks the status of the client daemon.
   * @returns {string}
   */
  status() {
    const daemonStatusCommand = ['daemon', 'status', '-format=json'];
    const { stdout } = spawnSync(daemonStatusCommand);

    const status = jsonify(stdout);
    this.#socketPath = status?.item?.socket_address;
    return status;
  }

  /**
   * Starts the daemon and checks the status to store the socket path.
   * @returns {Promise<void>}
   */
  async start() {
    const startDaemonCommand = ['daemon', 'start'];
    // We use spawn here because we want to check the stderr for specific logs
    const { childProcess, stderr } = await spawn(startDaemonCommand);
    this.#clientDaemonProcess = childProcess;

    // If we get a null/undefined, err on safe side and don't stop daemon when
    // we close the desktop client as the absence of the "daemon is already running"
    // message doesn't necessarily guarantee it's running (but it likely should be)
    if (stderr && !stderr.includes('The daemon is already running')) {
      this.#isClientDaemonAlreadyRunning = false;
      log.info('Cache daemon started, status from daemon:\n', stderr);
    } else {
      log.info('The cache daemon is already running at startup.');
    }

    this.status();
  }

  /**
   * Stops the daemon.
   */
  stop() {
    // We started up the daemon so we should stop it
    if (!this.#isClientDaemonAlreadyRunning) {
      const stopDaemonCommand = ['daemon', 'stop'];
      spawnSync(stopDaemonCommand);
    }

    // Kill the process if it's still running
    if (this.#clientDaemonProcess && !this.#clientDaemonProcess.killed) {
      isWindows()
        ? treeKill(this.#clientDaemonProcess.pid)
        : this.#clientDaemonProcess.kill();
    }
  }

  /**
   * Makes a request to the CLI to add the token to the daemons.
   * @param token
   * @param tokenId
   * @returns {Promise}
   */
  async addToken({ token, tokenId }) {
    // Successfully calling any Boundary CLI command with a token
    // will add the token both to the Client daemon and the Ferry DNS daemon,
    // so we just do a simple read on the input token and let the CLI do the rest.
    const readTokenCommand = [
      'auth-tokens',
      'read',
      `-id=${tokenId}`,
      `-addr=${runtimeSettings.clusterUrl}`,
      '-format=json',
      '-token=env://BOUNDARY_TOKEN',
      '-keyring-type=none',
    ];

    const sanitizedToken = sanitizer.base62EscapeAndValidate(token);
    const { stdout, stderr } = spawnSync(readTokenCommand, {
      BOUNDARY_TOKEN: sanitizedToken,
    });
    let parsedResponse = jsonify(stdout);

    if (parsedResponse?.status_code === 200) {
      // Ignore result if the request was successful
      return;
    }

    parsedResponse = jsonify(stderr);
    return Promise.reject({
      statusCode: parsedResponse?.status_code,
      ...parsedResponse?.api_error,
    });
  }

  search(requestData) {
    if (isWindows()) {
      return searchCliCommand(requestData);
    }

    delete requestData.token;
    const queryString = new URLSearchParams(requestData);

    const request = {
      method: 'GET',
      path: `http://internal.boundary.local/v1/search?${queryString.toString()}`,
      socketPath: this.#socketPath,
    };
    return unixSocketRequest(request);
  }
}

const searchCliCommand = (requestData) => {
  const searchCommand = [
    'search',
    '-format=json',
    '-token=env://BOUNDARY_TOKEN',
    `-resource=${requestData.resource}`,
  ];
  if (requestData.query) {
    searchCommand.push(`-query=${requestData.query}`);
  }
  if (requestData.filter) {
    searchCommand.push(`-filter=${requestData.filter}`);
  }
  if (requestData.force_refresh) {
    searchCommand.push(`-force-refresh=true`);
  }
  const sanitizedToken = sanitizer.base62EscapeAndValidate(requestData.token);

  const { stdout, stderr } = spawnSync(searchCommand, {
    BOUNDARY_TOKEN: sanitizedToken,
  });
  let parsedResponse = jsonify(stdout);

  if (parsedResponse?.status_code === 200) {
    return parsedResponse?.item;
  }

  parsedResponse = jsonify(stderr);

  // Log request data and response, but clean up token from log
  const requestCopy = { ...requestData };
  delete requestData.token;
  log.error(`searchCliCommand(${JSON.stringify(requestCopy)}):`, stderr);

  return Promise.reject({
    statusCode: parsedResponse?.status_code,
    ...parsedResponse?.api_error,
  });
};

// Export an instance so we get a singleton
module.exports = new ClientDaemonManager();
