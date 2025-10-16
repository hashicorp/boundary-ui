/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

const { spawn } = require('child_process');
const { shell } = require('electron');
const fs = require('fs');
const which = require('which');
const { isMac, isWindows } = require('../helpers/platform.js');
const store = require('./electron-store-manager');
const log = require('electron-log/main');

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
    isAvailable: async () => {
      if (!isMac()) return false;
      try {
        // Check for Windows App
        if (fs.existsSync('/Applications/Windows App.app')) {
          return true;
        }

        // Fallback: Use mdfind for Microsoft Remote Desktop
        return new Promise((resolve) => {
          const mdfind = spawn('mdfind', [
            'kMDItemCFBundleIdentifier == "com.microsoft.rdc.macos"',
          ]);
          let output = '';

          mdfind.stdout.on('data', (data) => {
            output += data.toString();
          });

          mdfind.on('close', (code) => {
            const found = code === 0 && output.trim().length > 0;
            resolve(found);
          });

          mdfind.on('error', () => resolve(false));
        });
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
  /**
   * Gets all available RDP clients on the current system
   * @returns {Promise<Array>} Array of available RDP clients with value
   */
  async getAvailableRdpClients() {
    const available = [];
    for (const client of RDP_CLIENTS) {
      if (await client.isAvailable()) {
        available.push({
          value: client.value,
        });
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
    const bestClient = availableClients.find(
      (client) => client.value !== 'none',
    );
    return bestClient ? bestClient.value : 'none';
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
    try {
      if (!preferredClient) {
        store.set('preferredRdpClient', 'none');
      } else {
        store.set('preferredRdpClient', preferredClient);
      }
    } catch (error) {
      log.error('Error setting preferred RDP client', error);
    }
  }

  /**
   * Launches RDP connection with the specified address and port
   * @param {string} address - Target address
   * @param {number} port - Target port
   */
  async launchRdpConnection(address, port) {
    if (isWindows()) {
      // Launch Windows mstsc
      const mstscArgs = [`/v:${address}:${port}`];
      const child = spawn('mstsc', mstscArgs, {
        detached: true,
        stdio: 'ignore',
      });
      child.unref();
    } else if (isMac()) {
      // Launch macOS RDP URL rdp://full%20address=s:address:port
      const fullAddress = `${address}:${port}`;
      const encoded = encodeURIComponent(`full address=s:${fullAddress}`);
      const rdpUrl = `rdp://${encoded}`;
      await shell.openExternal(rdpUrl);
    } else {
      log.error('RDP launch is only supported on Windows and macOS');
    }
  }

  /**
   * Launches RDP client using session ID
   * Retrieves proxy details from session manager and launches appropriate RDP client
   * @param {string} sessionId - The session ID to get proxy details for
   * @param {Object} sessionManager - Session manager instance to get proxy details from
   */
  async launchRdpClient(sessionId, sessionManager) {
    try {
      // Get proxy details from session manager
      const proxyDetails = sessionManager.getProxyDetailsById?.(sessionId);

      if (!proxyDetails) {
        return;
      }

      const { address, port } = proxyDetails;

      // Launch RDP connection
      await this.launchRdpConnection(address, port);
    } catch (error) {
      log.error('Failed to launch RDP client', error);
    }
  }
}

module.exports = new RdpClientManager();
