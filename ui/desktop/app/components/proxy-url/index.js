/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class ProxyUrlComponent extends Component {
  @service intl;

  @tracked selectedValue = this.intl.t('proxy-url.options.address-port');

  get isDefault() {
    return this.selectedValue === this.intl.t('proxy-url.options.address-port');
  }

  get isSSH() {
    return this.selectedValue === this.intl.t('proxy-url.options.ssh');
  }

  get sshCommand() {
    return `ssh ${this.args.proxyAddress} -p ${this.args.proxyPort}`;
  }

  @action
  updateContent(value, closeCallback) {
    this.selectedValue = value;
    closeCallback();
  }
}
