/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';

const PROTOCOL_WINDOWS_RDP = 'windows-rdp';

export default class SettingsCardPreferredClientsComponent extends Component {
  // =services
  @service rdp;

  // =getters

  /**
   * Returns the list of protocols and their available clients
   * @returns {Array<Object>}
   */
  get protocolClients() {
    return [
      {
        protocolType: PROTOCOL_WINDOWS_RDP,
        clients: this.rdp.rdpClients,
        preferredClient: this.rdp.preferredRdpClient,
        updateClient: this.updatePreferredRDPClient,
      },
    ];
  }

  // =methods

  /**
   * Updates the preferred RDP client
   * @param value
   * @return {Promise<void>}
   */
  @action
  async updatePreferredRDPClient({ target: { value } }) {
    await this.rdp.setPreferredRdpClient(value);
  }
}
