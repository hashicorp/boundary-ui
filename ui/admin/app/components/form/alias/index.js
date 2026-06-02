/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class FormAliasComponent extends Component {
  // =attributes

  /**
   * Normalizes a suffix value into dot-separated segments without
   * a leading `.`.
   * @param {string | null | undefined} suffix
   * @returns {string | null}
   */
  normalizeSuffixSegments(suffix) {
    if (!suffix) {
      return null;
    }
    const normalized = String(suffix).split('.').filter(Boolean).join('.');
    return normalized || null;
  }

  /**
   * Returns the combined suffix segments for the current alias scope.
   * For project aliases: `projectSuffix.orgSuffix`.
   * For other scopes: `scopeSuffix`.
   * @type {string|null}
   */
  get combinedSuffixSegments() {
    const projectSuffix = this.normalizeSuffixSegments(this.args.suffix);
    const scope = this.args.model?.scopeModel;

    if (!scope?.isProject) {
      return projectSuffix;
    }

    const orgSuffix = this.normalizeSuffixSegments(this.args.orgSuffix);

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
    if (fullValue.endsWith(suffix)) {
      return fullValue.slice(0, -suffix.length);
    }
    return fullValue;
  }

  // =actions

  /**
   * Recomposes model.value with the current suffix before delegating to @submit.
   * Guards against the case where the user opens edit mode and saves without
   * typing, leaving stale suffix segments on the stored value.
   */
  @action
  handleSubmit() {
    const { model } = this.args;
    const suffix = this.normalizedSuffix;
    if (model && suffix && !model.value?.endsWith(suffix)) {
      model.value = `${model.value}${suffix}`;
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

    model.value = value ? `${value}${suffix}` : value;
  }
}
