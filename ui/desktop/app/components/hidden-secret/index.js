/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class HiddenSecretComponent extends Component {
  textMask = '■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■';

  @tracked isHidden = false;

  get displaySecretValue() {
    if (typeof this.args.secret === 'object' && this.args.secret !== null) {
      return JSON.stringify(this.args.secret, null, 2);
    } else {
      return this.args.secret;
    }
  }

  @action
  toggleSecretVisibility() {
    this.isHidden = !this.isHidden;
  }
}
