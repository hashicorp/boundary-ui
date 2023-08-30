/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class SessionProxyUrlComponent extends Component {
  @service intl;

  @tracked selectedValue = this.args.isSSHTarget
    ? this.intl.t('resources.session.proxy-url.ssh')
    : this.intl.t('resources.session.proxy-url.address-port');

  get isAddressAndPort() {
    return (
      this.selectedValue ===
      this.intl.t('resources.session.proxy-url.address-port')
    );
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
