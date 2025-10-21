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
   * @private
   */
  @tracked #preferredRdpClient = null;

  /**
   * The list of available RDP clients fetched from the main process.
   * @type {Array<Object>}
   * @private
   */
  @tracked #rdpClients = [];

  // =attributes

  /**
   * Helper to determine if a preferred RDP client is set and the value is not "none". This is used to
   * conditionally show the "Open" button for RDP targets only when a preferred
   * RDP client is configured.
   * @returns {boolean}
   */
  get isPreferredRdpClientSet() {
    return this.#preferredRdpClient && this.#preferredRdpClient !== 'none';
  }

  get preferredRdpClient() {
    return this.#preferredRdpClient;
  }

  get rdpClients() {
    return this.#rdpClients;
  }

  // =methods

  /**
   * Fetches the list of available RDP clients from the main process.
   */
  async getRdpClients() {
    try {
      this.#rdpClients = await this.ipc.invoke('getRdpClients');
      return this.#rdpClients;
    } catch {
      // default to having 1 option of 'none' if it fails
      this.#rdpClients = [{ value: 'none' }];
      return this.#rdpClients;
    }
  }

  /**
   * Fetches the preferred RDP client from the main process.
   * @returns {string} The preferred RDP client
   */
  async getPreferredRdpClient() {
    try {
      this.#preferredRdpClient = await this.ipc.invoke('getPreferredRdpClient');
      return this.#preferredRdpClient;
    } catch {
      // default to 'none' if it fails
      this.#preferredRdpClient = 'none';
      return this.#preferredRdpClient;
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
      this.#preferredRdpClient = rdpClient;
      return this.#preferredRdpClient;
    } catch {
      // set to 'none' if it fails
      this.#preferredRdpClient = 'none';
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
