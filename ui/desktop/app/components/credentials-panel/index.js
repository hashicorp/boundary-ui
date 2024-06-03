/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class CredentialsPanelIndexComponent extends Component {
  @tracked isRawApiVisible = false;

  @action
  toggleCredentials() {
    this.isRawApiVisible = !this.isRawApiVisible;
  }
}
