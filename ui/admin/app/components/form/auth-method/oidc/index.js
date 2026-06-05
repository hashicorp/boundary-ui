/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
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
  @tracked skipPromptsList = this.isToggleChecked();

  /**
   * @returns {boolean}
   */
  get hasSavedSubClaimMap() {
    return (
      !this.args.model?.isNew &&
      this.args.model.account_claim_maps?.some((item) => item?.value === 'sub')
    );
  }

  /**
   * Filter 'sub' from dropdown options when updating
   * On creation, show all options including sub.
   * On update, hide sub unless it's the current value of the row (to display it when disabled).
   * @param {Object} rowData - The current row data
   * @returns {string[]}
   */
  toClaimOptions = (rowData) => {
    // On creation, show all options
    if (this.args.model?.isNew) {
      return this.toClaims;
    }

    // On update, filter "sub" unless it's the current value
    return this.toClaims.filter(
      (claim) => claim !== 'sub' || rowData?.value === 'sub',
    );
  };

  /**
   * @returns {string}
   */
  parsePromptsArray() {
    return this.args.model.prompts?.map((item) => item.value) ?? [];
  }

  /**
   * @returns {boolean}
   */
  isToggleChecked() {
    return this.args.model.prompts?.find((i) => i.value === 'none');
  }

  //actions
  /**
   * @param {string} value
   */
  @action
  toggleField(value) {
    this.skipPromptsList = !this.skipPromptsList;
    //If toggle is on, then add `none` to model, else remove it
    if (this.skipPromptsList) {
      this.args.model.prompts = [{ value }];
    } else {
      this.args.model.prompts = [];
    }
  }

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
