/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: MPL-2.0
 */

const { spawnSync, spawn } = require('../helpers/spawn-promise');
const jsonify = require('../utils/jsonify.js');
const generateErrorPromise = require('../utils/generateErrorPromise');
const log = require('electron-log/main');

class ClientAgentDaemonManager {
  /**
   * Checks the status of the client agent daemon.
   * @returns {string}
   */
  async status() {
    const clientAgentStatusCommand = ['client-agent', 'status', '-format=json'];
    // The status command can take a while to execute if it's not running as it
    // retries multiple times so we should set a timeout to not wait too long
    const { stderr, stdout } = await spawn(clientAgentStatusCommand, {
      timeout: 500,
    });

    let parsedResponse = jsonify(stdout);
    if (parsedResponse?.status_code === 200) {
      return parsedResponse.item;
    }

    log.warn('Client Agent Status:', stderr);
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

    log.warn('Client Agent Sessions:', stderr);
    return generateErrorPromise(stderr);
  }

  /**
   * Pauses the client agent daemon.
   * @return {Promise<*>}
   */
  async pause() {
    const clientAgentPauseCommand = ['client-agent', 'pause', '-format=json'];
    // We use spawn here as pausing can take a while to execute and using spawnSync
    // can cause the app to completely freeze and be unresponsive during that time
    const { stderr, stdout } = await spawn(clientAgentPauseCommand, {
      timeout: 10000,
    });

    let parsedResponse = jsonify(stdout);
    if (parsedResponse?.status_code === 200) {
      return parsedResponse.item;
    }

    log.warn('Client Agent Pause:', stderr);
    return generateErrorPromise(stderr);
  }

  /**
   * Resumes the client agent daemon.
   * @return {Promise<*>}
   */
  async resume() {
    const clientAgentResumeCommand = ['client-agent', 'resume', '-format=json'];
    const { stderr, stdout } = await spawn(clientAgentResumeCommand, {
      timeout: 10000,
    });

    let parsedResponse = jsonify(stdout);
    if (parsedResponse?.status_code === 200) {
      return parsedResponse.item;
    }

    log.warn('Client Agent Resume:', stderr);
    return generateErrorPromise(stderr);
  }
}

// Export an instance so we get a singleton
module.exports = new ClientAgentDaemonManager();
