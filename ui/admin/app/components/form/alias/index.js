/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class FormAliasComponent extends Component {
  // =attributes

  /**
   * Returns the alias suffix prefixed with `.`
   * @type {string|null}
   */
  get normalizedSuffix() {
    const suffix = this.args.suffix;
    if (!suffix) return null;
    return suffix.startsWith('.') ? suffix : `.${suffix}`;
  }

  /**
   * User-editable portion of the alias value shown in the input. When a suffix
   * is present, strip the suffix from the model value for display.
   * @type {string}
   */
  get displayBaseValue() {
    const { model } = this.args;
    if (!model) return '';

    const fullValue = model.value || '';
    const suffix = this.normalizedSuffix;
    if (!suffix || !fullValue.endsWith(suffix)) return fullValue;

    return fullValue.slice(0, -suffix.length);
  }

  // =actions

  /**
   * Handles input changes
   */
  @action
  handleHostIdChange({ target: { value } }) {
    this.args.model.authorize_session_arguments = {
      host_id: value,
    };
  }

  /**
   * Updates the alias value as the user types.
   */
  @action
  handleBaseValueChange({ target: { value } }) {
    const { model } = this.args;
    const suffix = this.normalizedSuffix;

    model.value = suffix && value ? `${value}${suffix}` : value;
  }
}
