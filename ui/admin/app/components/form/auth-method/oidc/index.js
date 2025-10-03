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
   * Default empty row for account claim maps
   * Kept as a field to avoid creating a new object on every re-render
   */
  defaultAccountClaimMaps = [{ key: '', value: '' }];

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
   * Returns account_claims data, defaulting to an empty row if not present
   */
  get accountClaimMapsData() {
    const data = this.args.model.account_claim_maps;
    return data ?? this.defaultAccountClaimMaps;
  }

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
   * Adds a new empty row to account claim maps
   */
  @action
  addAccountClaimMap() {
    this.args.model.account_claim_maps = [
      ...this.accountClaimMapsData,
      { key: '', value: '' },
    ];
  }

  /**
   * Removes a row from account claim maps
   * @param {Object} rowData - The row to remove
   */
  @action
  removeAccountClaimMap(rowData) {
    let newData = this.accountClaimMapsData.filter((item) => item !== rowData);
    // Ensure at least one empty row remains in the UI
    if (newData.length === 0) {
      newData = [{ key: '', value: '' }];
    }
    this.args.model.account_claim_maps = newData;
  }

  /**
   * Updates the account claim maps in the model
   */
  @action
  updateAccountClaimMap(rowData, property, value) {
    rowData[property] = value;
    this.args.model.account_claim_maps = [...this.accountClaimMapsData];
  }

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
