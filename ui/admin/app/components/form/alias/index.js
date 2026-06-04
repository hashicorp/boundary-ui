/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class FormAliasComponent extends Component {
  // =attributes

  /**
   * Returns the combined suffix segments for the current alias scope.
   * Only project aliases have suffix values: `projectSuffix.orgSuffix`.
   * Returns null for all other scope types.
   * @type {string|null}
   */
  get combinedSuffixSegments() {
    const scope = this.args.model?.scopeModel;
    if (!scope?.isProject) {
      return null;
    }

    const projectSuffix = this.args.suffix;
    const orgSuffix = this.args.orgSuffix;

    return `${projectSuffix}.${orgSuffix}`;
  }

  /**
   * Returns the alias suffix prefixed with `.`
   * @type {string|null}
   */
  get normalizedSuffix() {
    const suffix = this.combinedSuffixSegments;
    if (!suffix) {
      return null;
    }
    return `.${suffix}`;
  }

  /**
   * User-editable portion of the alias value shown in the input. When a suffix
   * is present, strip it from the stored value.
   * @type {string}
   */
  get displayBaseValue() {
    const fullValue = this.args.model.value ?? '';
    const suffix = this.normalizedSuffix;
    // This will be the common case when there is no suffix for global aliases
    if (!suffix) {
      return fullValue;
    }
    // This is our normal case for project level aliases
    // with current suffix segments present on the stored value
    const segments = fullValue.split('.');
    return segments.slice(0, -2).join('.');
  }

  // =actions

  @action
  handleSubmit() {
    const { model } = this.args;
    const suffix = this.normalizedSuffix;
    if (model && suffix) {
      model.value = `${this.displayBaseValue}${suffix}`;
    }
    return this.args.submit();
  }

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
    const suffix = this.normalizedSuffix ?? '';

    model.value = `${value}${suffix}`;
  }
}
