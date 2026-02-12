/**
 * Copyright IBM Corp. 2021, 2026
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
const generateErrorPromise = require('../utils/generateErrorPromise');

class CacheDaemonManager {
  #socketPath;
  #isCacheDaemonAlreadyRunning = true;
  #cacheDaemonProcess;

  get socketPath() {
    return this.#socketPath;
  }

  /**
   * Checks the status of the cache daemon.
   * @returns {Promise}
   */
  status() {
    const daemonStatusCommand = ['cache', 'status', '-format=json'];
    const { stdout, stderr } = spawnSync(daemonStatusCommand);

    const parsedResponse = jsonify(stdout);
    this.#socketPath = parsedResponse?.item?.socket_address;

    if (parsedResponse?.status_code === 200) {
      return parsedResponse.item;
    }

    log.warn('Cache Daemon Status:', stderr);
    return generateErrorPromise(stderr);
  }

  /**
   * Starts the daemon and checks the status to store the socket path.
   * @returns {Promise<void>}
   */
  async start() {
    const startDaemonCommand = ['cache', 'start'];
    // We use spawn here because we want to check the stderr for specific logs
    const { childProcess, stderr } = await spawn(startDaemonCommand);
    this.#cacheDaemonProcess = childProcess;

    // If we get a null/undefined, err on safe side and don't stop daemon when
    // we close the desktop client as the absence of the "cache is already running"
    // message doesn't necessarily guarantee it's running (but it likely should be)
    if (stderr && !stderr.includes('The cache is already running')) {
      this.#isCacheDaemonAlreadyRunning = false;
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
    if (!this.#isCacheDaemonAlreadyRunning) {
      const stopDaemonCommand = ['cache', 'stop'];
      spawnSync(stopDaemonCommand);
    }

    // Kill the process if it's still running
    if (this.#cacheDaemonProcess && !this.#cacheDaemonProcess.killed) {
      isWindows()
        ? treeKill(this.#cacheDaemonProcess.pid)
        : this.#cacheDaemonProcess.kill();
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
    // will add the token both to the cache daemon and the Ferry DNS daemon,
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

    log.warn('Cache Daemon Add Token:', stderr);
    return generateErrorPromise(stderr);
  }

  async search(requestData) {
    const start = Date.now();
    // Log request data, but clean up token from log
    const { auth_token_id, token, ...logRequestData } = requestData;

    if (isWindows()) {
      const result = await searchCliCommand(requestData);

      const end = Date.now();
      log.debug(`Search request took ${end - start} ms`, logRequestData);

      return result;
    }

    delete requestData.token;
    console.log(
      'Making search request to cache daemon with data:',
      requestData,
    );
    const queryString = new URLSearchParams(requestData);
    console.log(
      'Constructed query string for cache daemon request:',
      queryString.toString(),
    );

    const request = {
      method: 'GET',
      path: `http://internal.boundary.local/v1/search?${queryString.toString()}`,
      socketPath: this.#socketPath,
    };

    const result = await unixSocketRequest(request);
    const end = Date.now();
    log.debug(`Search request took ${end - start} ms`, logRequestData);

    return result;
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
    searchCommand.push(`-filter=${requestData.filter}`); //is this even needed?
  }
  if (requestData.sort_by && requestData.sort_direction) {
    searchCommand.push(`-sort-by=${requestData.sort_by}`);
    searchCommand.push(`-sort-direction=${requestData.sort_direction}`);
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

  // Log request data and response, but clean up token from log
  const requestCopy = { ...requestData };
  delete requestCopy.token;
  log.error(`searchCliCommand(${JSON.stringify(requestCopy)}):`, stderr);

  return generateErrorPromise(stderr);
};

// Export an instance so we get a singleton
module.exports = new CacheDaemonManager();
