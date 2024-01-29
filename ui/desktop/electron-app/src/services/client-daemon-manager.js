/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

const {
  spawnSync,
  spawn,
  spawnAsyncJSONPromise,
} = require('../helpers/spawn-promise');
const jsonify = require('../utils/jsonify.js');
const { unixSocketRequest } = require('../helpers/request-promise');
const runtimeSettings = require('./runtime-settings');
const sanitizer = require('../utils/sanitizer.js');
const { isWindows } = require('../helpers/platform.js');

class ClientDaemonManager {
  #socketPath;
  #isClientDaemonAlreadyRunning = true;

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
    const { stderr } = await spawn(startDaemonCommand);

    // If we get a null/undefined, err on safe side and don't stop daemon when
    // we close the desktop client
    if (stderr && !stderr.includes('The daemon is already running')) {
      this.#isClientDaemonAlreadyRunning = false;
    }
    this.status();
  }

  /**
   * Stops the daemon.
   */
  stop() {
    if (this.#isClientDaemonAlreadyRunning) {
      return;
    }

    const stopDaemonCommand = ['daemon', 'stop'];
    spawnSync(stopDaemonCommand);
  }

  /**
   * Makes a request to the socket to add the token to the daemon.
   * If the token already exists, this will update the token in the
   * client daemon.
   * @param token
   * @param tokenId
   * @returns {Promise}
   */
  async addToken({ token, tokenId }) {
    // TODO: Should this and search just always call CLI even for non-Windows?
    if (isWindows()) {
      return addTokenCliCommand(token);
    }

    const postBody = {
      auth_token_id: sanitizer.base62EscapeAndValidate(tokenId),
      boundary_addr: runtimeSettings.clusterUrl,
      auth_token: sanitizer.base62EscapeAndValidate(token),
    };
    const request = {
      method: 'POST',
      path: 'http://internal.boundary.local/v1/tokens',
      socketPath: this.#socketPath,
    };
    return unixSocketRequest(request, postBody);
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

const addTokenCliCommand = (token) => {
  const addTokenCommand = [
    'daemon',
    'add-token',
    `-addr=${runtimeSettings.clusterUrl}`,
    '-format=json',
    '-token=env://BOUNDARY_TOKEN',
    '-keyring-type=none',
  ];
  const sanitizedToken = sanitizer.base62EscapeAndValidate(token);

  // TODO: Is setting an env var for the address the only way? I'm surprised to not see an -addr flag
  const { stdout, stderr } = spawnSync(addTokenCommand, {
    BOUNDARY_TOKEN: sanitizedToken,
  });
  let parsedResponse = jsonify(stdout);

  if (parsedResponse?.status_code === 204) {
    // 204 has no response body
    return;
  }

  parsedResponse = jsonify(stderr);
  return Promise.reject({
    statusCode: parsedResponse?.status_code,
    ...parsedResponse?.api_error,
  });
};

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
  const sanitizedToken = sanitizer.base62EscapeAndValidate(requestData.token);

  const { stdout, stderr } = spawnSync(searchCommand, {
    BOUNDARY_TOKEN: sanitizedToken,
  });
  let parsedResponse = jsonify(stdout);

  if (parsedResponse?.status_code === 200) {
    return parsedResponse?.item;
  }

  parsedResponse = jsonify(stderr);
  return Promise.reject({
    statusCode: parsedResponse?.status_code,
    ...parsedResponse?.api_error,
  });
};

// Export an instance so we get a singleton
module.exports = new ClientDaemonManager();
