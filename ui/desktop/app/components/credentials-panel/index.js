/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class CredentialsPanelIndexComponent extends Component {
  customOrder = ['username', 'password'];

  @tracked isRawApiVisible = false;

  @action
  toggleCredentials() {
    this.isRawApiVisible = !this.isRawApiVisible;
  }
}
