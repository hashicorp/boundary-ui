/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Service from '@ember/service';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class RdpService extends Service {
  // =services

  @service ipc;

  // =properties

  /**
   * The preferred RDP client set by the user.
   * @type {string|null}
   */
  @tracked _preferredRdpClient = null;

  /**
   * The list of available RDP clients fetched from the main process.
   * @type {Array<Object>}
   */
  @tracked _rdpClients = [];

  // =attributes

  /**
   * Helper to determine if a preferred RDP client is set and the value is not "none". This is used to
   * conditionally show the "Open" button for RDP targets only when a preferred
   * RDP client is configured.
   * @returns {boolean}
   */
  get isPreferredRdpClientSet() {
    return this.preferredRdpClient && this.preferredRdpClient !== 'none';
  }

  get rdpClients() {
    if (this._rdpClients.length === 0) {
      this.getRdpClients();
    }
    return this._rdpClients;
  }

  get preferredRdpClient() {
    if (this._preferredRdpClient === null) {
      this.getPreferredRdpClient();
    }
    return this._preferredRdpClient;
  }

  // =methods

  /**
   * Fetches the list of available RDP clients from the main process.
   */
  async getRdpClients() {
    try {
      const clients = await this.ipc.invoke('getRdpClients');
      this._rdpClients = clients;
      return clients;
    } catch (error) {
      console.error('Failed to fetch RDP clients:', error);
      this._rdpClients = [];
      return [];
    }
  }

  /**
   * Fetches the preferred RDP client from the main process.
   * @returns {string} The preferred RDP client
   */
  async getPreferredRdpClient() {
    try {
      const preferredRdpClient = await this.ipc.invoke('getPreferredRdpClient');
      this._preferredRdpClient = preferredRdpClient;
      return preferredRdpClient;
    } catch (error) {
      console.error('Failed to get preferred RDP client:', error);
      this._preferredRdpClient = 'none';
      return 'none';
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
      this._preferredRdpClient = rdpClient;
      return rdpClient;
    } catch (error) {
      console.error('Failed to set preferred RDP client:', error);
      throw error;
    }
  }

  /**
   * Launches the RDP client for a given session.
   * The session_id is passed to the main process, which securely retrieves
   * the proxy details and constructs the appropriate RDP connection parameters.
   * @param {string} session_id - The ID of the active session
   */
  async launchRdpClient(session_id) {
    if (!session_id) {
      throw new Error('No session ID provided.');
    }

    try {
      await this.ipc.invoke('launchRdpClient', session_id);
    } catch (error) {
      console.error('Failed to launch RDP client:', error);
      throw error;
    }
  }
}
