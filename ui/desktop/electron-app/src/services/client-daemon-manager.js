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
    const data = spawnSync(daemonStatusCommand);

    const status = jsonify(data);
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
    if (isWindows()) {
      return addTokenCliCommand(token);
    }
    // TODO: Remove this after testing
    // return addTokenCliCommand(token);

    const postBody = {
      auth_token_id: tokenId,
      boundary_addr: runtimeSettings.clusterUrl,
      auth_token: token,
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
    // TODO: Remove this after testing
    // return searchCliCommand(requestData);

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
    '-format=json',
    '-token=env://BOUNDARY_TOKEN',
    '-keyring-type=none',
  ];
  const sanitizedToken = sanitizer.base62EscapeAndValidate(token);

  const data = spawnSync(addTokenCommand, sanitizedToken);
  const parsedResponse = jsonify(data);

  if (parsedResponse?.status_code === 204) {
    return;
  }
  // TODO: What's in this response? Can it be parsed into JSON correctly? Probably need to get it from stderr
  return Promise.reject({
    statusCode: parsedResponse?.status_code,
  });
};

const searchCliCommand = (requestData) => {
  const searchCommand = [
    'search',
    '-format=json',
    '-token=env://BOUNDARY_TOKEN',
    `-resource=${requestData.resource}`,
  ];
  // TODO: Should we just go through requestData object and add all keys with values instead of if statements?
  if (requestData.query) {
    searchCommand.push(`-query=${requestData.query}`);
  }
  if (requestData.filter) {
    searchCommand.push(`-filter=${requestData.filter}`);
  }
  const sanitizedToken = sanitizer.base62EscapeAndValidate(requestData.token);

  const data = spawnSync(searchCommand, sanitizedToken);
  const parsedResponse = jsonify(data);

  if (parsedResponse?.status_code === 200) {
    return jsonify(data)?.item;
  } else {
    // TODO: What's in this response? Can it be parsed into JSON correctly? Probably need to get it from stderr
    return Promise.reject({
      statusCode: parsedResponse?.status_code,
    });
  }
};

// Export an instance so we get a singleton
module.exports = new ClientDaemonManager();
