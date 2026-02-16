/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class RoseFormComponent extends Component {
  // =attributes

  /**
   * This field indicates whether edit mode is toggled
   * and only applies if `@showEditToggle` is true.
   * @type {boolean}
   */
  @tracked isEditable = false;

  /**
   * By default, this field is unconditionally equal to the value of the passed
   * `@disabled` argument.  If desired the form may be "locked" from editing
   * until the user intentionally enables edit mode (`@showEditToggle` is true),
   * in which case the value is dependent on `@disabled` and `this.isEditable`.
   * @type {boolean}
   */
  get disabled() {
    if (this.args.showEditToggle) return this.args.disabled || !this.isEditable;
    return this.args.disabled;
  }

  /**
   * True if showEditToggle is true and edit mode is enabled.
   * @type {boolean}
   */
  get showEditToggleButton() {
    return this.args.showEditToggle && !this.isEditable;
  }

  // =actions

  /**
   * Calls the passed `onSubmit` function while disabling the default form
   * submit behavior.
   *
   * Submit handlers _may optionally return a promise_.  If they do, the promise
   * is assumed to reflect the state of the submission operation,
   * i.e. if the promise resolves the submission was successful and if it
   * rejects, the submission failed.
   * @param {Event} e
   */
  @action
  handleSubmit(e) {
    e.preventDefault();
    e.stopPropagation();
    const submitResult = this.args.onSubmit();
    // If the submit handler returns a promise, we want to handle success
    // by re-enabling read-only mode on the form (if applicable).
    // Since submit is allowed to fail in this context and we don't want
    // unhandled rejection warnings, we have a no-op catch.
    if (submitResult?.then) {
      submitResult.then(() => (this.isEditable = false)).catch(() => {});
    }
    return false;
  }

  /**
   * Calls the passed `cancel` function.
   * @param {Event} e
   */
  @action
  handleCancel() {
    this.disableEdit();
    this.args.cancel();
  }

  /**
   * Enables edit mode, which only applies when `@showEditToggle` is true.
   */
  @action
  enableEdit() {
    this.isEditable = true;
    if (this.args.edit) this.args.edit();
  }

  /**
   * Disables edit mode, which only applies when `@showEditToggle` is true.
   */
  @action
  disableEdit() {
    this.isEditable = false;
  }
}
