/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

const { spawnSync, spawn } = require('../helpers/spawn-promise');

// TODO: Rename commands from ferry to client-agent

class ClientAgentDaemonManager {
  /**
   * Checks the status of the client agent daemon.
   * @returns {string}
   */
  status() {
    const clientAgentStatusCommand = ['ferry', 'status', '-format=json'];
    const { stdout } = spawnSync(clientAgentStatusCommand);

    return JSON.parse(stdout);
  }

  /**
   * Gets the sessions from the client agent daemon.
   * @returns {*|Promise}
   */
  getSessions() {
    const clientAgentSessionsCommand = ['ferry', 'sessions', '-format=json'];
    const { stdout, stderr } = spawnSync(clientAgentSessionsCommand);

    let parsedResponse = JSON.parse(stdout);

    if (parsedResponse?.status_code === 200) {
      return parsedResponse.items;
    }

    parsedResponse = JSON.parse(stderr);
    return Promise.reject({
      statusCode: parsedResponse?.status_code,
      ...parsedResponse?.api_error,
    });
  }
}

// Export an instance so we get a singleton
module.exports = new ClientAgentDaemonManager();
