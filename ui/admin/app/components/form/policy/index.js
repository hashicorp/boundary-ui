/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

const RETENTION_POLICY = {
  forever: -1,
  custom: 1,
  do_not_protect: 0,
};

const DELETION_POLICY = { do_not_delete: 0, custom: 1 };

export default class FormPolicyComponent extends Component {
  //attributes

  @tracked is_custom_retention_selected = this.args.model.retain_for?.days > 0;
  @tracked is_custom_deletion_selected = this.args.model.delete_after?.days > 0;
  @tracked retain_for_overridable = this.args.model.retain_for?.overridable;
  @tracked delete_after_overridable = this.args.model.delete_after?.overridable;

  @tracked delete_days = this.args.model.delete_after?.days;
  @tracked retain_days = this.args.model.retain_for?.days;

  //methods

  /**
   * Returns retention policy options list
   * @type {array}
   */
  get listRententionOptions() {
    return RETENTION_POLICY;
  }

  /**
   * Returns deletion policy options list, if the retain days are -1 (forever)
   * then we should force the delete option to be do not delete
   * @type {array}
   */
  get listDeletionOptions() {
    if (this.retain_days < 0) {
      return { do_not_delete: 0 };
    } else {
      return DELETION_POLICY;
    }
  }

  /**
   * Force the delete After select list to have `do not delete` option selected
   * @type {boolean}
   */
  get disableDeleteOptions() {
    return this.retain_days < 0 ? true : false;
  }

  /**
   * Returns policy type
   * @type {string}
   */
  get selectRetentionPolicyType() {
    if (this.retain_days < 0) {
      return 'forever';
    } else if (this.retain_days >= 1) {
      return 'custom';
    } else {
      return 'do_not_protect';
    }
  }

  /**
   * Returns policy type
   * @type {string}
   */
  get selectDeletePolicyType() {
    return this.delete_days > 0 && this.is_custom_deletion_selected
      ? 'custom'
      : 'do_not_delete';
  }

  //actions
  /**
   * Show custom text field when custom option is selected
   */

  @action
  handlePolicyTypeSelection({ target: { value: selectedVal, name: policy } }) {
    switch (policy) {
      case 'retention_policy':
        this.retain_days = selectedVal;
        //When `forever` is selected, we should automatically select `do_not_delete`
        //and hide the custom input
        if (selectedVal < 0) {
          this.delete_days = 0;
          this.is_custom_deletion_selected = false;
        }
        if (selectedVal > 0) {
          this.is_custom_retention_selected = true;
        } else {
          this.is_custom_retention_selected = false;
        }
        break;

      case 'deletion_policy':
        this.delete_days = selectedVal;
        if (selectedVal > 0) {
          this.is_custom_deletion_selected = true;
        } else {
          this.is_custom_deletion_selected = false;
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
   * Callback submit and construct retain_days and delete_days model objects
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
    this.is_custom_retention_selected = this.args.model.retain_for?.days > 0;
    this.is_custom_deletion_selected = this.args.model.delete_after?.days > 0;
    this.retain_for_overridable = this.args.model.retain_for?.overridable;
    this.delete_after_overridable = this.args.model.delete_after?.overridable;
    this.retain_days = this.args.model.retain_for?.days;
    this.delete_days = this.args.model.delete_after?.days;
  }
}
