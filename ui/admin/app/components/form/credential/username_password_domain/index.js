/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class FormCredentialUsernamePasswordDomainComponent extends Component {
  // =actions

  /**
   * Pass the username input value for further processing.
   */
  @action
  handleUsername(event) {
    const { value } = event.target;
    this.processUsername(value);
  }

  /**
   * Process the username input and call the submit action
   */
  @action
  handleSubmit() {
    this.processUsername(this.args.model.username);
    this.args.submit();
  }

  /**
   * Process the username input by splitting it into username and domain
   * and updating the model accordingly.
   * @param {string} value - The input value from the username field
   */
  processUsername(value) {
    const arr = value?.split(/[@\\]/) ?? [];

    // Check if the length of the arr is 2
    // This is to avoid cases where the username might be hello@world@again
    // We let the server handle the validation in that case
    // and only update the model if we have exactly one username and one domain after splitting
    if (arr.length === 2) {
      const isDomainFirst = value.includes('\\');
      const username = isDomainFirst ? arr[1] : arr[0];
      const domain = isDomainFirst ? arr[0] : arr[1];

      // Update the model with the values only if both username and domain are present
      if (username && domain) {
        this.args.model.username = username;
        this.args.model.domain = domain;
      }
    }
  }
}
