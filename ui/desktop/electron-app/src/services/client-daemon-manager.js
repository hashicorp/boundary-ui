/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

const { spawnSync, spawn } = require('../helpers/spawn-promise');
const jsonify = require('../utils/jsonify.js');
const { unixSocketRequest } = require('../helpers/request-promise');
const runtimeSettings = require('./runtime-settings');

class ClientDaemonManager {
  #socketPath;

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
    // TODO: Finalize how often the daemon should be refreshing
    const startDaemonCommand = ['daemon', 'start', '-refresh-interval', '10'];
    await spawn(startDaemonCommand);
    this.status();
  }

  /**
   * Stops the daemon.
   */
  stop() {
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
  addToken({ token, tokenId }) {
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
    const queryString = new URLSearchParams(requestData);

    const request = {
      method: 'GET',
      path: `http://internal.boundary.local/v1/search?${queryString.toString()}`,
      socketPath: this.#socketPath,
    };
    return unixSocketRequest(request);
  }
}

// Export an instance so we get a singleton
module.exports = new ClientDaemonManager();
