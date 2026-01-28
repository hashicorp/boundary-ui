/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
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

  /**
   * Returns true if any of the resources that are being created are still saving.
   * @type {boolean}
   */
  get isSaving() {
    const { org, project, target, role } = this.args.model;
    return org.isSaving || project.isSaving || target.isSaving || role.isSaving;
  }

  // =actions

  /**
   * Passes in target address and port to submit function for further proccessing.
   */
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
