/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Component from '@glimmer/component';
import { options } from 'api/models/auth-method';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class FormAuthMethodOidcComponent extends Component {
  // =attributes
  /**
   * @type {object}
   */
  signingAlgorithms = options.oidc.signing_algorithms;

  /**
   * @type {object}
   */
  toClaims = options.oidc.account_claim_maps.to;

  /**
   * @type {string}
   */
  newToClaim = options.oidc.account_claim_maps.to[0];

  /**
   * @type {string}
   */
  newSigningAlgorithm = options.oidc.signing_algorithms[0];

  /**
   * @type {string}
   */
  prompts = options.oidc.prompts;

  @tracked selectedPrompts = this.parsePromptsArray();

  /**
   * @returns {string}
   */
  parsePromptsArray() {
    return this.args.model.prompts?.map((item) => item.value) ?? [];
  }

  //actions

  /**
   * @param {string} option
   * @param {object} event
   */
  @action
  updatePrompt(value, event) {
    const currentSelection = { value };
    const previousSelection = this.args.model.prompts || [];

    // Add the selected option to the model, only when the checkbox is in checked state
    if (event.target.checked) {
      this.args.model.prompts = [...previousSelection, currentSelection];
    } else {
      // When the checkbox is unchecked, remove the option form the exisiting list
      const removeSelection = previousSelection.filter(
        (prompt) => prompt.value !== value,
      );
      this.args.model.prompts = [...removeSelection];
    }
  }
}
