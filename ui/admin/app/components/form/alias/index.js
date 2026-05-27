/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';

export default class FormAliasComponent extends Component {
  @service store;

  // =attributes

  /**
   * Normalizes a suffix value into dot-separated segments without
   * a leading `.`.
   * @param {string | null | undefined} suffix
   * @returns {string | null}
   */
  normalizeSuffixSegments(suffix) {
    if (!suffix) return null;
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

    if (!scope?.isProject) return projectSuffix;

    const orgScope = scope.scopeID
      ? this.store.peekRecord('scope', scope.scopeID)
      : null;
    const orgSuffix = this.normalizeSuffixSegments(orgScope?.alias_suffix);

    if (!projectSuffix) return orgSuffix;
    if (!orgSuffix) return projectSuffix;
    if (
      projectSuffix === orgSuffix ||
      projectSuffix.endsWith(`.${orgSuffix}`)
    ) {
      return projectSuffix;
    }

    return `${projectSuffix}.${orgSuffix}`;
  }

  /**
   * Returns the alias suffix prefixed with `.`
   * @type {string|null}
   */
  get normalizedSuffix() {
    const suffix = this.combinedSuffixSegments;
    if (!suffix) return null;
    return `.${suffix}`;
  }

  /**
   * Fallback for project aliases when a suffix cannot be resolved from scope:
   * derive `.<segmentN-1>.<segmentN>` from the current model value.
   * @type {string|null}
   */
  get trailingTwoSegmentSuffix() {
    const scope = this.args.model?.scopeModel;
    const fullValue = this.args.model?.value || '';
    if (!scope?.isProject || !fullValue) return null;

    const lastDot = fullValue.lastIndexOf('.');
    if (lastDot <= 0) return null;

    const secondLastDot = fullValue.lastIndexOf('.', lastDot - 1);
    if (secondLastDot <= 0) return null;

    return fullValue.slice(secondLastDot);
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
    const suffix = this.normalizedSuffix || this.trailingTwoSegmentSuffix;
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
    const suffix = this.normalizedSuffix || this.trailingTwoSegmentSuffix;

    model.value = suffix && value ? `${value}${suffix}` : value;
  }
}
