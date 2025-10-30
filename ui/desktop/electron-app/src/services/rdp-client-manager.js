/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */
const { spawn, spawnSync } = require('../helpers/spawn-promise');
const { shell } = require('electron');
const fs = require('fs');
const which = require('which');
const { isMac, isWindows } = require('../helpers/platform.js');
const store = require('./electron-store-manager');

// RDP Client Configuration
const RDP_CLIENTS = [
  {
    value: 'mstsc',
    isAvailable: async () => {
      if (!isWindows()) return false;
      try {
        const mstscPath = await which('mstsc', { nothrow: true });
        return Boolean(mstscPath);
      } catch {
        return false;
      }
    },
  },
  {
    value: 'windows-app',
    isAvailable: () => {
      if (!isMac()) return false;
      try {
        // Check for Windows App
        if (fs.existsSync('/Applications/Windows App.app')) {
          return true;
        }

        // Fallback: Use mdfind for Microsoft Remote Desktop
        else {
          const result = spawnSync(
            ['kMDItemCFBundleIdentifier == "com.microsoft.rdc.macos"'],
            {},
            'mdfind',
          );
          // `mdfind` returns an object with stdout containing the path of the app if found
          // Example: '/Applications/Windows App.app\n'
          return result.stdout && result.stdout.trim().length > 0;
        }
      } catch {
        return false;
      }
    },
  },
  {
    value: 'none',
    isAvailable: () => true,
  },
];

class RdpClientManager {
  // Track active RDP processes for cleanup
  #activeProcesses = [];
  /**
   * Gets all available RDP clients on the current system
   * @returns {Promise<Array>} Array of available RDP client values
   */
  async getAvailableRdpClients() {
    const available = [];
    for (const client of RDP_CLIENTS) {
      if (await client.isAvailable()) {
        available.push(client.value);
      }
    }
    return available;
  }

  /**
   * Gets the best default RDP client (first available that's not 'none')
   * @returns {Promise<string>} Best RDP client value or 'none'
   */
  async getBestDefaultRdpClient() {
    const availableClients = await this.getAvailableRdpClients();
    const bestClient = availableClients.find((client) => client !== 'none');
    return bestClient ?? 'none';
  }

  /**
   * Gets the user's preferred RDP client, auto-detecting if not set
   * @returns {Promise<string>} Preferred RDP client value
   */
  async getPreferredRdpClient() {
    let preferredClient = store.get('preferredRdpClient');

    if (!preferredClient) {
      // Auto-detect and set the best available client
      preferredClient = await this.getBestDefaultRdpClient();
      store.set('preferredRdpClient', preferredClient);
    }
    return preferredClient;
  }

  /**
   * Sets the user's preferred RDP client
   * @param {string} preferredClient - The RDP client value to set as preferred
   */
  setPreferredRdpClient(preferredClient) {
    if (!preferredClient) {
      store.set('preferredRdpClient', 'none');
    } else {
      store.set('preferredRdpClient', preferredClient);
    }
  }

  /**
   * Launches RDP connection with the specified address and port
   * @param {string} address - Target address
   * @param {number} port - Target port
   */
  async launchRdpConnection(address, port) {
    if (isWindows()) {
      console.log('Launching Windows RDP client');
      // Launch Windows mstsc and track it for cleanup
      const mstscArgs = [`/v:${address}:${port}`];
      const { childProcess } = await spawn(mstscArgs, {}, 'mstsc');
      // Add to activeProcesses array for cleanup
      this.#activeProcesses.push(childProcess);
    } else if (isMac()) {
      console.log('Launching macOS RDP client');
      // Launch macOS RDP URL - no process to track as it's handled by the system
      const fullAddress = `${address}:${port}`;
      const encoded = encodeURIComponent(`full address=s:${fullAddress}`);
      const rdpUrl = `rdp://${encoded}`;
      const { childProcess } = await spawn([rdpUrl], {}, 'open');
      this.#activeProcesses.push(childProcess);
      console.log(this.#activeProcesses, 'active processes');
      // await shell.openExternal(rdpUrl);
    }
  }

  /**
   * Launches RDP client using session ID
   * Retrieves session object from session manager and launches appropriate RDP client
   * @param {string} sessionId - The session ID to get session for
   * @param {Object} sessionManager - Session manager instance to get session from
   */
  async launchRdpClient(sessionId, sessionManager) {
    // Get session object from session manager
    const session = sessionManager.getSessionById(sessionId);

    if (!session) {
      return;
    }

    const {
      proxyDetails: { address, port },
    } = session;
    // Launch RDP connection
    await this.launchRdpConnection(address, port);
  }

  /**
   * Stop all active RDP processes
   */
  stopAll() {
    console.log('before clearing active processes', this.#activeProcesses);

    for (const process of this.#activeProcesses) {
      if (!process.killed) {
        console.log('killing process', process.pid);
        process.kill();
        console.log('after killed process', process.pid);
      }
    }
    // log killed processes
    console.log('Cleared processes', this.#activeProcesses);
    // Clear the active processes array after stopping all processes
    console.log('Clearing active processes', this.#activeProcesses);
    this.#activeProcesses = [];
  }
}

module.exports = new RdpClientManager();
