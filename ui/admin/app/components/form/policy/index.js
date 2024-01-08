/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

const RETENTION_POLICY = ['forever', 'custom'];

const DELETION_POLICY = ['do_not_delete', 'custom'];

export default class FormPolicyComponent extends Component {
  //attributes

  @tracked is_custom_retention_selected = this.args.model.retain_for?.days;
  @tracked is_custom_deletion_selected = this.args.model.delete_after?.days;
  @tracked retain_for_overridable = this.args.model.retain_for?.overridable;
  @tracked delete_after_overridable = this.args.model.delete_after?.overridable;

  @tracked delete_days = this.args.model.delete_after?.days;
  @tracked retain_days = this.args.model.retain_for?.days;

  //methods

  /**
   * Returns retention policy options list
   * @type {array}
   */
  get retentionPolicyOptions() {
    return RETENTION_POLICY;
  }

  /**
   * Returns deletion policy options list
   * @type {array}
   */
  get deletionPolicyOptions() {
    return DELETION_POLICY;
  }

  /**
   * Returns the selected option for the delete policy dropdown
   * @type {string}
   */
  get selectedDeleteDropdownOption() {
    return this.is_custom_deletion_selected ? 'custom' : 'do_not_delete';
  }

  /**
   * Returns the selected option for the retain policy dropdown
   * @type {string}
   */
  get selectedRetainDropdownOption() {
    return this.is_custom_retention_selected ? 'custom' : 'forever';
  }

  //actions

  /**
   * Show custom text field when custom option is selected
   */
  @action
  handlePolicyTypeSelection({ target: { value: selectedType, name: policy } }) {
    switch (policy) {
      case 'retention_policy':
        if (selectedType === 'custom') {
          this.is_custom_retention_selected = true;
        } else {
          this.is_custom_retention_selected = false;
          this.retain_days = null;
        }
        break;
      case 'deletion_policy':
        if (selectedType === 'custom') {
          this.is_custom_deletion_selected = true;
        } else {
          this.is_custom_deletion_selected = false;
          this.delete_days = null;
        }
        break;
    }
  }

  /**
   * Toggle retain for & delete after overridables
   */
  @action
  handleOverridableToggle(field) {
    this[field] = !this[field];
  }

  /**
   * Set retain for input value to a tracked property
   */
  @action
  handleRetainForInput({ target: { value } }) {
    this.retain_days = value;
  }

  /**
   * Set delete after input value to a tracked property
   */
  @action
  handleDeleteAfterInput({ target: { value } }) {
    this.delete_days = value;
  }

  /**
   * Callback submit and construct retain_for and delete_after model objects
   */
  @action
  async submit() {
    this.args.model.retain_for = {
      days: this.retain_days,
      overridable: this.retain_for_overridable,
    };
    this.args.model.delete_after = {
      days: this.delete_days,
      overridable: this.delete_after_overridable,
    };
    await this.args.submit();
  }

  /**
   * Callback cancel and
   * Resets all the tracked properties after rollback
   */
  @action
  cancel() {
    this.args.cancel();
    this.is_custom_retention_selected = this.args.model.retain_for?.days;
    this.is_custom_deletion_selected = this.args.model.delete_after?.days;
    this.retain_for_overridable = this.args.model.retain_for?.overridable;
    this.delete_after_overridable = this.args.model.delete_after?.overridable;
    this.retain_days = this.args.model.retain_for?.days;
    this.delete_days = this.args.model.delete_after?.days;
  }
}
