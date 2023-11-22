/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Component from '@glimmer/component';
import { options } from 'api/models/auth-method';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { set } from '@ember/object';

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
    return (this.args.model.prompts || []).map((item) => item.value);
  }

  //actions

  /**
   * @param {string} option
   * @param {object} event
   */
  @action
  updatePrompt(option, event) {
    const currentSelection = option.split(',').map((value) => ({ value }));

    const previousSelection = this.args.model.prompts;

    //when the checkbox is unchecked, remove the option form the exisiting list
    const removeSelection = previousSelection.filter((i) => i.value !== option);

    //add the selected option to the model, only when the checkbox is in checked state
    if (event.target.id && event.target.checked) {
      if (previousSelection) {
        set(this.args.model, 'prompts', [
          ...previousSelection,
          ...currentSelection,
        ]);
      } else {
        set(this.args.model, 'prompts', [...currentSelection]);
      }
    } else {
      set(this.args.model, 'prompts', [...removeSelection]);
    }
  }
}
