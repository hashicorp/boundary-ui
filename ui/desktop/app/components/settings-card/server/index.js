/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class SettingsCardServerComponent extends Component {
  // =services
  @service intl;

  // =attributes
  /**
   * Returns the provider name for HCP and generic name for non HCP servers
   * @type {string}
   */
  get providerName() {
    const regex = /hashicorp\.cloud/;
    if (this.args.model.serverInformation?.match(regex)) {
      return this.intl.t('settings.hcp');
    } else {
      return this.intl.t('settings.self-managed');
    }
  }
}
