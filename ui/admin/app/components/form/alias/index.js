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
   * User-editable portion of the alias value shown in the input. Prefers
   * `base_value`; falls back to stripping `suffix` from `value` for legacy aliases.
   * @type {string}
   */
  get displayBaseValue() {
    const { model, suffix } = this.args;
    if (!model) return '';
    if (model.base_value) return model.base_value;
    const value = model.value ?? '';
    // For legacy aliases without `base_value`, recover it by removing the
    // suffix from the composed `value`.
    if (suffix && value.endsWith(suffix)) {
      return value.slice(0, -suffix.length);
    }
    return value;
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
    model.value = value;
    model.base_value = value;
  }
}
