/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Service from '@ember/service';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

const { __electronLog } = globalThis;

export default class RdpService extends Service {
  // =services

  @service ipc;

  // =properties

  /**
   * The preferred RDP client set by the user.
   * @type {string|null}
   * @private
   */
  @tracked preferredRdpClient = null;

  /**
   * The list of available RDP clients fetched from the main process.
   * @type {Array<Object>}
   * @private
   */
  @tracked rdpClients = [];

  // =attributes

  /**
   * Helper to determine if a preferred RDP client is set and the value is not "none". This is used to
   * conditionally show the "Open" button for RDP targets only when a preferred
   * RDP client is configured.
   * @returns {boolean}
   */
  get isPreferredRdpClientSet() {
    return (
      this.preferredRdpClient !== null && this.preferredRdpClient !== 'none'
    );
  }

  // =methods

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
      this.rdpClients = [{ value: 'none' }];
      return this.rdpClients;
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
      this.preferredRdpClient = 'none';
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
      this.preferredRdpClient = 'none';
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
