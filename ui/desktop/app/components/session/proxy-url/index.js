/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import {
  TYPE_TARGET_SSH,
  TYPE_TARGET_TCP,
  TYPE_TARGET_RDP,
} from 'api/models/target';

const ADDRESS_PORT = 'address-port';
const DROPDOWN_OPTIONS = [ADDRESS_PORT, TYPE_TARGET_SSH];

export default class SessionProxyUrlComponent extends Component {
  // =services

  @service intl;

  // =attributes

  @tracked selectedValue = null;

  get isRDPTarget() {
    return this.args.targetType === TYPE_TARGET_RDP;
  }

  /**
   * Returns the current value to be displayed in the dropdown.
   * If a value is selected, it returns that value.
   * Otherwise, it defaults to 'address-port' for TCP targets or the targetType for others.
   */
  get currentValue() {
    return (
      this.selectedValue ??
      (this.args.targetType === TYPE_TARGET_TCP
        ? ADDRESS_PORT
        : this.args.targetType)
    );
  }

  /**
   * Returns the copy snippet data based on the current selected value.
   */
  get copySnippetData() {
    const { proxyAddress, proxyPort } = this.args;
    if (this.currentValue === TYPE_TARGET_SSH) {
      return {
        address: `ssh ${proxyAddress} -p ${proxyPort}`,
      };
    }
    // For TCP and RDP, we return the address and port
    return {
      address: proxyAddress,
      port: proxyPort,
    };
  }

  /**
   * Only show AddressPort and SSH options. We do not show RDP here
   */
  get dropdownOptions() {
    return DROPDOWN_OPTIONS;
  }

  // =actions

  /** Updates the selected value and closes the dropdown.
   * @param {string} optionId - The selected option.
   * @param {function} closeCallback - The callback function to close the dropdown.
   */
  @action
  handleSelect(optionId, closeCallback) {
    this.selectedValue = optionId;
    closeCallback();
  }
}
