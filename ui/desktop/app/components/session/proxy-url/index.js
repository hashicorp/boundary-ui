/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import {
  TYPE_TARGET_RDP,
  TYPE_TARGET_SSH,
  TYPE_TARGET_TCP,
} from 'api/models/target';

const ADDRESS_PORT = 'address-port';

export default class SessionProxyUrlComponent extends Component {
  // =services

  @service intl;

  // =attributes

  @tracked selectedValue = null;

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
    switch (this.currentValue) {
      case ADDRESS_PORT:
        return {
          address: proxyAddress,
          port: proxyPort,
        };
      case TYPE_TARGET_SSH:
        return {
          address: `ssh ${proxyAddress} -p ${proxyPort}`,
        };
      case TYPE_TARGET_RDP:
        // TODO: This is a just a placeholder. Update this based on the design and product requirements.
        return {
          address: `rdp ${proxyAddress} -p ${proxyPort}`,
        };
      default:
        return null;
    }
  }

  /** Returns the dropdown options based on the target type.
   */
  get dropdownOptions() {
    let options = [ADDRESS_PORT];

    options.push(
      this.args.targetType === TYPE_TARGET_RDP
        ? TYPE_TARGET_RDP
        : TYPE_TARGET_SSH,
    );

    return options;
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
