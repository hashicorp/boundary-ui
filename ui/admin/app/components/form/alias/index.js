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

  stripTrailingSegments(value, segmentCount) {
    if (!value || !segmentCount) return value;

    let cutIndex = value.length;
    for (let i = 0; i < segmentCount; i++) {
      const lastDot = value.lastIndexOf('.', cutIndex - 1);
      if (lastDot <= 0) return value;
      cutIndex = lastDot;
    }

    return value.slice(0, cutIndex);
  }

  /**
   * User-editable portion of the alias value shown in the input. When a suffix
   * is present, strip the suffix from the model value for display.
   * @type {string}
   */
  get displayBaseValue() {
    const { model } = this.args;
    if (!model) return '';

    const fullValue = model.value ?? '';
    const suffix = this.normalizedSuffix;
    if (!suffix) return fullValue;
    if (fullValue.endsWith(suffix)) return fullValue.slice(0, -suffix.length);

    const suffixSegmentCount = suffix.split('.').filter(Boolean).length;
    return this.stripTrailingSegments(fullValue, suffixSegmentCount);
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
      const segmentCount = suffix.split('.').filter(Boolean).length;
      const base = this.stripTrailingSegments(model.value ?? '', segmentCount);
      model.value = base ? `${base}${suffix}` : model.value;
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
