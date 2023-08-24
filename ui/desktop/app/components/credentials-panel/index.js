/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
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
