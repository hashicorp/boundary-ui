/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class FormFieldSecretInputIndexComponent extends Component {
  // =properties
  /**
   * Tracks when secret can be updated
   * @type {boolean}
   */
  @tracked isEditing = false;

  /**
   * Returns true if the resource form is in read only mode
   * @type {boolean}
   */
  get isDisabled() {
    return this.args.isDisabled;
  }

  /**
   * Returns true if the resource form is in edit mode and
   * `edit` button is enabled for the secret field.
   * This state lets the user to update the secret fields if they like
   * @type {boolean}
   */
  get isActionable() {
    return this.args.showEditButton && !this.isEditing;
  }

  // =actions

  /**
   * Sets the secret field to be updated
   * when `edit` button is clicked in Actionable view
   */
  @action
  enableEdit() {
    if (!this.args.isDisabled) this.isEditing = true;
  }

  /**
   * Clears updated secret when cancel button is
   * clicked in Actionable view.
   * Sets the secret field back to disabled mode
   */
  @action
  cancelEdit() {
    this.isEditing = false;
    this.args.cancel();
  }
}
