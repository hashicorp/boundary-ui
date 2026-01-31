/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { options } from 'api/models/auth-method';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class FormAuthMethodOidcComponent extends Component {
  createEmptyClaimsScope = () => ({ value: '' });
  createEmptyClaimMap = () => ({ key: '', value: '' });
  createEmptyAllowedAudience = () => ({ value: '' });
  createEmptySigningAlgorithm = () => ({ value: '' });
  createEmptyIdpCaCert = () => ({ value: '' });
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

  /**
   * Adds a new empty row to account claim maps
   */
  @action
  addRow(field, emptyRow) {
    this.args.model[field] = [...this.args.model[field], emptyRow()];
  }

  /**
   * Removes a row from account claim maps
   */
  @action
  removeRow(field, emptyRow, rowData) {
    let rows = this.args.model[field].filter((item) => item !== rowData);
    // Ensure at least one empty row exists for editing
    if (rows.length === 0) {
      rows = [emptyRow()];
    }
    this.args.model[field] = rows;
  }

  /**
   * Updates the account claim maps in the model
   */
  @action
  updateRow(field, rowData, property, { target: { value } }) {
    rowData[property] = value;
    this.args.model[field] = [...this.args.model[field]];
  }
}
