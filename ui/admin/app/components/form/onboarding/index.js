/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class FormOnboardingComponent extends Component {
  // =properties
  @tracked targetAddress;
  @tracked targetAddressInvalid = false;
  @tracked targetPort;
  @tracked targetPortInvalid = false;

  // =actions
  @action
  submit() {
    // Check targetAddress and targetPort are valid before submit
    this.targetAddressInvalid = !this.targetAddress;
    this.targetPortInvalid = !this.targetPort;
    if (!this.targetAddressInvalid && !this.targetPortInvalid) {
      // Call submit fn passed to the form
      this.args.submit(this.targetAddress, this.targetPort);
    }
  }
}
