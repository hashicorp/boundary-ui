/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { service } from '@ember/service';

export default class SettingsCardServerComponent extends Component {
  // =services
  @service intl;

  // =attributes
  /**
   * Returns the provider name for HCP and generic name for non HCP servers
   * @type {string}
   */
  get providerName() {
    const regex = /boundary\.(hashicorp|hcp)/;
    if (this.args.model.serverInformation?.match(regex)) {
      return this.intl.t('settings.hcp');
    } else {
      return this.intl.t('settings.self-managed');
    }
  }
}
