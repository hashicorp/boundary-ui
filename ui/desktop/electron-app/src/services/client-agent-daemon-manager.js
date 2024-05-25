/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

const { spawnSync, spawn } = require('../helpers/spawn-promise');
const jsonify = require('../utils/jsonify.js');
const generateErrorPromise = require('../utils/generateErrorPromise');

class ClientAgentDaemonManager {
  /**
   * Checks the status of the client agent daemon.
   * @returns {string}
   */
  async status() {
    const clientAgentStatusCommand = ['client-agent', 'status', '-format=json'];
    const { stdout, stderr } = spawnSync(clientAgentStatusCommand);

    let parsedResponse = jsonify(stdout);
    if (parsedResponse?.status_code === 200) {
      return parsedResponse.item;
    }

    return generateErrorPromise(stderr);
  }

  /**
   * Gets the sessions from the client agent daemon.
   * @returns {*|Promise}
   */
  async getSessions() {
    const clientAgentSessionsCommand = [
      'client-agent',
      'sessions',
      '-format=json',
    ];
    const { stdout, stderr } = spawnSync(clientAgentSessionsCommand);

    let parsedResponse = jsonify(stdout);

    if (parsedResponse?.status_code === 200) {
      return parsedResponse.items;
    }

    return generateErrorPromise(stderr);
  }
}

// Export an instance so we get a singleton
module.exports = new ClientAgentDaemonManager();
