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
    const { model } = this.args;
    if (!model) return '';
    return model.base_value || model.value || '';
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
