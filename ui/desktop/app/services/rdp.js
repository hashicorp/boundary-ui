/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import Service from '@ember/service';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export const RDP_CLIENT_NONE = 'none';
export const RDP_CLIENT_WINDOWS_APP = 'windows-app';
export const RDP_CLIENT_MSTSC = 'mstsc';
export const RDP_CLIENT_WINDOWS_APP_LINK =
  'https://apps.apple.com/us/app/windows-app/id1295203466';
export const RDP_CLIENT_MSTSC_LINK =
  'https://learn.microsoft.com/windows-server/remote/remote-desktop-services/remotepc/uninstall-remote-desktop-connection';

const { __electronLog } = globalThis;
const macRecommendedRdpClient = {
  name: RDP_CLIENT_WINDOWS_APP,
  link: RDP_CLIENT_WINDOWS_APP_LINK,
};
const windowsRecommendedRdpClient = {
  name: RDP_CLIENT_MSTSC,
  link: RDP_CLIENT_MSTSC_LINK,
};

export default class RdpService extends Service {
  // =services

  @service ipc;

  // =properties

  /**
   * The preferred RDP client set by the user.
   * @type {string|null}
   */
  @tracked preferredRdpClient = null;

  /**
   * The list of available RDP clients fetched from the main process.
   * @type {Array<String>}
   */
  @tracked rdpClients = [];

  /**
   * The recommended RDP client based on platform when only 'none' is available.
   * @type {Object|null}
   */
  @tracked recommendedRdpClient = null;

  // =attributes

  /**
   * Helper to determine if a preferred RDP client is set and the value is not "none". This is used to
   * conditionally show the "Open" button for RDP targets only when a preferred
   * RDP client is configured.
   * @returns {boolean}
   */
  get isPreferredRdpClientSet() {
    return (
      this.preferredRdpClient !== null &&
      this.preferredRdpClient !== RDP_CLIENT_NONE
    );
  }

  // =methods

  async initialize() {
    await Promise.all([
      this.getRdpClients(),
      this.getPreferredRdpClient(),
      this.getRecommendedRdpClient(),
    ]);
  }

  /**
   * Fetches the list of available RDP clients from the main process.
   */
  async getRdpClients() {
    // Return cached clients if already fetched
    if (this.rdpClients.length > 0) {
      return this.rdpClients;
    }
    try {
      this.rdpClients = await this.ipc.invoke('getRdpClients');
      return this.rdpClients;
    } catch (error) {
      __electronLog?.error('Failed to fetch RDP clients', error.message);
      // default to 'none' option if it fails
      this.rdpClients = [RDP_CLIENT_NONE];
      return this.rdpClients;
    }
  }

  /**
   * Gets the recommended RDP client based on OS platform.
   */
  async getRecommendedRdpClient() {
    try {
      // return cached recommended client if already set
      if (this.recommendedRdpClient !== null) {
        return this.recommendedRdpClient;
      }
      const { isWindows, isMac } = await this.ipc.invoke('checkOS');
      if (isWindows) {
        this.recommendedRdpClient = windowsRecommendedRdpClient;
      } else if (isMac) {
        this.recommendedRdpClient = macRecommendedRdpClient;
      }
    } catch (error) {
      __electronLog?.error(
        'Failed to set recommended RDP client',
        error.message,
      );
      this.recommendedRdpClient = null;
    }
  }

  /**
   * Fetches the preferred RDP client from the main process.
   * @returns {string} The preferred RDP client
   */
  async getPreferredRdpClient() {
    // Return cached preferred RDP client if already fetched
    if (this.preferredRdpClient !== null) {
      return this.preferredRdpClient;
    }
    try {
      this.preferredRdpClient = await this.ipc.invoke('getPreferredRdpClient');
      return this.preferredRdpClient;
    } catch (error) {
      __electronLog?.error(
        'Failed to fetch preferred RDP client',
        error.message,
      );
      // default to 'none' if it fails
      this.preferredRdpClient = RDP_CLIENT_NONE;
      return this.preferredRdpClient;
    }
  }

  /**
   * Sets the preferred RDP client by the user.
   * @param {string} rdpClient - The value of the preferred RDP client
   * @returns {Promise<string>} The updated preferred RDP client
   */
  async setPreferredRdpClient(rdpClient) {
    try {
      await this.ipc.invoke('setPreferredRdpClient', rdpClient);
      this.preferredRdpClient = rdpClient;
      return this.preferredRdpClient;
    } catch (error) {
      __electronLog?.error('Failed to set preferred RDP client', error.message);
      // set to 'none' if it fails
      this.preferredRdpClient = RDP_CLIENT_NONE;
    }
  }

  /**
   * Launches the RDP client for a given session.
   * The `sessionId` is passed to the main process, which securely retrieves
   * the proxy details and constructs the appropriate RDP connection parameters.
   * @param {string} sessionId - The ID of the active session
   */
  async launchRdpClient(sessionId) {
    await this.ipc.invoke('launchRdpClient', sessionId);
  }
}
